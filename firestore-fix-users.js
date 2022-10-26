//= ================
// clear && node firestore-fix-users.js
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

const userCollRef = db.collection("users");
const postsCollRef = db.collection("posts");
const threadsCollRef = db.collection("threads");

const usersQuerySnap = await userCollRef.get();

await db
  .runTransaction(
    async (tran) => {
      const userTranUpdatePromises = usersQuerySnap.docs.map(
        (userSnap) =>
          new Promise((resolve) => {
            const docCountQueries = [
              postsCollRef.where("userId", "==", userSnap.id).count().get(),
              threadsCollRef.where("userId", "==", userSnap.id).count().get(),
            ];

            resolve(
              Promise.all(docCountQueries).then(([postsSnap, threadsSnap]) => {
                const dto = {
                  postsCount: postsSnap.data().count,
                  threadsCount: threadsSnap.data().count,
                };

                tran.update(userSnap.ref, dto);

                log(
                  `- ✔️  updated user: ${userSnap.id} with "postsCount: ${dto.postsCount}" and "threadsCount: ${dto.threadsCount}"`
                );
              })
            );
          })
      );

      return Promise.all(userTranUpdatePromises);
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
