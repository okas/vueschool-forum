//= ================
// clear && dotenv_config_path=.env.local node -r dotenv/config firestore-fix-auth-user.js <oldUserId> <newUserId>
//= ================

import { initializeApp } from "firebase/app";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import firebaseConfig from "./src/config/firebase.js";

const { log, warn, error } = console;

if (process.argv.length < 4 || !process.argv[2] || !process.argv[3]) {
  error("Didn't get both user ID's for replacing, exiting.");
  process.exit(-1);
}

const oldUserId = process.argv[2];
const newUserId = process.argv[3];
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

log("- transaction start");

const oldUserDocRef = doc(db, "users", oldUserId);
const oldUsersDocSnap = await getDoc(oldUserDocRef);

if (oldUsersDocSnap.exists()) {
  log(`- 📌 found user doc to work with: '${oldUserId}'`);
  log(`- 📌 new user is going to have an id: '${newUserId}'`);
} else {
  warn(
    `-  ❌ user doc not found from db: '${oldUserId}', continue fixing dependent docs`
  );
}

const postsCollRef = collection(db, "posts");
const threadsCollRef = collection(db, "threads");

const hasUserOrContributorQueries = [
  getDocs(
    query(
      threadsCollRef,
      where("contributors", "array-contains", oldUsersDocSnap.id)
    )
  ),
  getDocs(query(threadsCollRef, where("userId", "==", oldUsersDocSnap.id))),
  getDocs(query(postsCollRef, where("userId", "==", oldUsersDocSnap.id))),
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
          contributors: arrayRemove(oldUserId),
        })
        .update(qryDocSnap.ref, {
          contributors: arrayUnion(newUserId),
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
      const newUserDocRef = doc(db, "users", newUserId);
      const newUserDocData = oldUsersDocSnap.data();
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

runTransaction(
  db,
  (transaction) => {
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
  .then((x) => {
    log("- ✅ all updates done");

    process.exit();
  })
  .catch((reason) => {
    error("- ❌ transaction failed");
    error(reason);
    process.exit(-1);
  });
