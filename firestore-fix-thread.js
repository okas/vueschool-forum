//= ================
// clear && node firestore-fix-thread.js
//= ================

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./service-account.json" assert { type: "json" };

const { log, warn, error } = console;

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

log("- ➡️  transaction start");

const threadsQuerySnap = await db.collection("threads").get();

/**
 * @param {FirebaseFirestore.Transaction} transaction
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} threadDocSnap
 * @returns {Promise<void>[]}
 */
async function checkAndFixThreadDoc(transaction, threadDocSnap) {
  {
    const threadDocData = threadDocSnap.data();

    /** @type { Array<string> | undefined } */
    const posts = threadDocData?.posts;

    if (!posts?.length) {
      log(
        `- ❕no posts: "${threadDocSnap.id}", fixes cannot be determined or might be unnecessary`
      );

      return;
    }

    if (!threadDocData.firstPostId) {
      const firstPostId = posts[0];

      const lastPostData = firstPostId || {
        lastPostId: "",
        lastPostAt: "",
      };

      const dto = {
        firstPostId,
        ...lastPostData,
      };

      transaction.update(threadDocSnap.ref, dto);

      log(
        `- ✔️  updated thread: "${threadDocSnap.id}", set "firstPostId": "${
          dto.firstPostId
        }"${lastPostData ?? ", resetted last post data."}`
      );
    }

    if (!threadDocData.lastPostId || !threadDocData.lastPostAt) {
      const lastPostId = posts.at(-1);
      const lastPostDocSnap = await transaction.get(
        db.collection("posts").doc(lastPostId)
      );

      if (!lastPostDocSnap.exists) {
        warn(
          `- ‼️  failed to set fix thread: "${threadDocSnap.id}", last post IF from posts prop do not exist in posts collection, skip"`
        );

        return;
      }

      const dto = {
        lastPostId: lastPostDocSnap.id,
        lastPostAt: lastPostDocSnap.data().publishedAt.seconds,
      };

      transaction.update(threadDocSnap.ref, dto);

      log(
        `- ✔️  updated thread: "${threadDocSnap.id}", set "lastPostId": "${dto.lastPostId}" & "lastPostAt": "${dto.lastPostAt}"`
      );
    }
  }
}

await db
  .runTransaction(
    async (tran) => {
      return Promise.all(
        threadsQuerySnap.docs.map((threadDocSnap) =>
          checkAndFixThreadDoc(tran, threadDocSnap)
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
