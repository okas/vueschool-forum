//= ================
// clear && node firestore-fix-forums.js
//= ================

// NB! As this script relies on correct post and thread data, be sure these are correct beforehand!

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import serviceAccount from "./service-account.json" assert { type: "json" };

const { log, warn, error } = console;

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

log("- ➡️  transaction start");

const forumsQuerySnap = await db.collection("forums").get();

/**
 * @param {FirebaseFirestore.Transaction} transaction
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} forumDocSnap
 * @returns {Promise<void>[]}
 */
async function checkAndFixForumDoc(transaction, forumDocSnap) {
  {
    const forumDocData = forumDocSnap.data();

    /** @type { Array<string> | undefined } */
    const threads = forumDocData?.threads;

    if (!threads?.length) {
      log(
        `- ❕no threads: "${forumDocSnap.id}", fixes cannot be determined or might be unnecessary`
      );

      return;
    }

    if (!forumDocData.lastPostId) {
      const lastPostProjectionDocSnap = await transaction.get(
        db
          .collection("threads")
          .where("forumId", "==", forumDocSnap.id)
          .orderBy("lastPostAt", "desc")
          .limit(1)
          .select("lastPostId", "lastPostAt")
      );

      if (lastPostProjectionDocSnap.empty) {
        warn(
          `- ‼️  failed to set fix thread: "${forumDocSnap.id}", last post ID from posts prop do not exist in posts collection, skip"`
        );

        return;
      }

      const { lastPostId, lastPostAt } =
        lastPostProjectionDocSnap.docs[0].data();

      transaction.update(forumDocSnap.ref, {
        lastPostId,
        lastPostAt: convertToTimeStamp(lastPostAt),
      });

      log(
        `- ✔️  updated thread: "${
          forumDocSnap.id
        }", set "lastPostId": "${lastPostId}" & "lastPostAt" (here as Date): "${convertToDate(
          lastPostAt
        )}"`
      );
    }
  }
}

/**
 * @param {number | FirebaseFirestore.Timestamp } fbTimeStampOrAsIs Number presents seconds, not MS.
 * @returns {Date}
 */
function convertToDate(fbTimeStampOrAsIs) {
  return fbTimeStampOrAsIs instanceof Timestamp
    ? fbTimeStampOrAsIs.toDate()
    : new Date(fbTimeStampOrAsIs * 1000);
}

/**
 * @param {number | Date | string | FirebaseFirestore.Timestamp } input Number and sting presents seconds, not MS.
 * @returns {Timestamp}
 */
function convertToTimeStamp(input) {
  return input instanceof Timestamp
    ? input
    : input instanceof Date
    ? Timestamp.fromDate(input)
    : typeof input === "number"
    ? new Timestamp(input, 0)
    : Timestamp.fromDate(new Date(input));
}

await db
  .runTransaction(
    async (tran) => {
      return Promise.all(
        forumsQuerySnap.docs.map((forumDocSnap) =>
          checkAndFixForumDoc(tran, forumDocSnap)
        )
      );
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
