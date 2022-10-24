//= ================
// clear && node firestore-fix-stats.js
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

const statsDocRef = db.collection("common").doc("stats");

const userCollRef = db.collection("users");
const postsCollRef = db.collection("posts");
const threadsCollRef = db.collection("threads");

await db
  .runTransaction(
    async (tran) => {
      const docCountQueries = [
        userCollRef.count().get(),
        postsCollRef.count().get(),
        threadsCollRef.count().get(),
      ];

      await Promise.all(docCountQueries).then(
        ([usersSnap, postsSnap, threadsSnap]) => {
          const dto = {
            usersCount: usersSnap.data().count,
            postsCount: postsSnap.data().count,
            threadsCount: threadsSnap.data().count,
          };

          tran.set(statsDocRef, dto);

          log(
            `- ✔️  updated stats: "usersCount": "${dto.usersCount}", "postsCount: ${dto.postsCount}", "threadsCount: ${dto.threadsCount}"`
          );
        }
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
