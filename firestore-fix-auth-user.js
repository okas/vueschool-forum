//= ================
// clear && node firestore-fix-auth-user.js <oldUserId> <newUserId>
//= ================

import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./service-account.json" assert { type: "json" };

const { log, warn, error } = console;

if (process.argv.length < 4 || !process.argv[2] || !process.argv[3]) {
  error("Didn't get both user ID's for replacing, exiting.");
  process.exit(-1);
}

const oldUserId = process.argv[2];
const newUserId = process.argv[3];

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

log("- ➡️  transaction start");

const userCollRef = db.collection("users");

const oldUserDocRef = userCollRef.doc(oldUserId);
const oldUserDocSnap = await oldUserDocRef.get();

if (oldUserDocSnap.exists()) {
  log(`- 📌 found user doc to work with: '${oldUserId}'`);
  log(`- 📌 new user is going to have an id: '${newUserId}'`);
} else {
  warn(
    `-  ❌ user doc not found from db: '${oldUserId}', continue fixing dependent docs`
  );
}

const postsCollRef = db.collection("posts");
const threadsCollRef = db.collection("threads");

const hasUserOrContributorQueries = [
  threadsCollRef
    .where("contributors", "array-contains", oldUserDocSnap.id)
    .get(),
  threadsCollRef.where("userId", "==", oldUserDocSnap.id).get(),
  postsCollRef.where("userId", "==", oldUserDocSnap.id).get(),
];

const [threadContributorsDocSnaps, threadUserIdDocSnaps, postUserIdDocSnaps] =
  await Promise.all(hasUserOrContributorQueries);

/**
 * @param {import("firebase/firestore").Transaction} transaction
 * @param {import("firebase/firestore").QueryDocumentSnapshot<import("firebase/firestore").DocumentData>[]} docSnaps
 * @returns {Promise<void>[]}
 */
function updateThreadContributorsPromises(transaction, docSnaps) {
  return docSnaps.docs.map((qryDocSnap) =>
    new Promise(() => {
      transaction
        .update(qryDocSnap.ref, {
          contributors: FieldValue.arrayRemove(oldUserId),
        })
        .update(qryDocSnap.ref, {
          contributors: FieldValue.arrayUnion(newUserId),
        });
      log(`-  ✔️  updated thread ${qryDocSnap.id} contributors`);
    }).catch(handleTransactionOpFailure)
  );
}

/**
 * @param {import("firebase/firestore").Transaction} transaction
 * @param {import("firebase/firestore").QueryDocumentSnapshot<import("firebase/firestore").DocumentData>[]} docSnaps
 * @param {String} docTypeName
 * @returns {Promise<void>[]}
 */
function updateDependentUserPromises(transaction, docSnaps, docTypeName) {
  return docSnaps.docs.map((qryDocSnap) =>
    new Promise(() => {
      transaction.update(qryDocSnap.ref, {
        userId: newUserId,
      });
      log(`-  ✔️  updated ${docTypeName} ${qryDocSnap.id} userId`);
    }).catch(handleTransactionOpFailure)
  );
}

/**
 * @param {import("firebase/firestore").Transaction} transaction
 * @returns {Promise<void>}
 */
async function reCreateUserDocument(transaction) {
  try {
    return await new Promise(() => {
      const newUserDocRef = userCollRef.doc(newUserId);
      const newUserDocData = oldUserDocSnap.data();
      transaction.delete(oldUserDocRef).set(newUserDocRef, newUserDocData);
      log(`-  ✔️  recreated user document with id ${newUserId}`);
    });
  } catch (reason) {
    return handleTransactionOpFailure(reason);
  }
}

function handleTransactionOpFailure(reason) {
  error("- ❌ operation failed failed");
  error(reason);
}

db.runTransaction(
  async (transaction) => {
    Promise.all([
      ...updateThreadContributorsPromises(
        transaction,
        threadContributorsDocSnaps
      ),
      ...updateDependentUserPromises(
        transaction,
        threadUserIdDocSnaps,
        "thread"
      ),
      ...updateDependentUserPromises(transaction, postUserIdDocSnaps, "post"),
      reCreateUserDocument(transaction),
    ]);

    return Promise.resolve();
  },
  { maxAttempts: 1 }
)
  .then(() => {
    log("- ✅ all updates done");
    process.exit();
  })
  .catch((reason) => {
    error("- ❌ transaction failed");
    error(reason);
    process.exit(-1);
  });
