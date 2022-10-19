//= ================
// clear && node firestore-fix-thread.js
//= ================

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./service-account.json" assert { type: "json" };

const { log, error } = console;

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

log("- ➡️  transaction start");

const threadsQuerySnap = await db.collection("threads").get();

await db
  .runTransaction(
    async (tran) => {
      const threadTranUpdatePromises = threadsQuerySnap.docs.map(
        (threadDocSnap) =>
          new Promise((resolve) => {
            const docData = threadDocSnap.data();

            if (!docData.firstPostId) {
              const dto = {
                firstPostId: docData?.posts[0] ?? "",
              };

              tran.update(threadDocSnap.ref, dto);

              log(
                `- ✔️  updated thread: ${threadDocSnap.id} with fixed "firstPostId": "${dto.firstPostId}"`
              );
            }

            resolve();
          })
      );

      return Promise.all(threadTranUpdatePromises);
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
