//= ================
// clear && dotenv_config_path=.env.local node -r dotenv/config firestore-fix-user.js
//= ================

import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import firebaseConfig from "./src/config/firebase.js";

const { log, error } = console;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

log("- transaction start");

const userCollRef = collection(db, "users");
const postsCollRef = collection(db, "posts");
const threadsCollRef = collection(db, "threads");

const usersQuerySnap = await getDocs(query(userCollRef));

runTransaction(
  db,
  async (tran) => {
    const userTranUpdatePromises = usersQuerySnap.docs.map(
      (userSnap) =>
        new Promise((resolve) => {
          const countQueries = [
            getDocs(query(postsCollRef, where("userId", "==", userSnap.id))),
            getDocs(query(threadsCollRef, where("userId", "==", userSnap.id))),
          ];

          resolve(
            Promise.allSettled(countQueries).then((results) => {
              const dto = {
                postsCount: results[0].value.size,
                threadsCount: results[1].value.size,
              };

              tran.update(userSnap.ref, dto);

              log(
                `- ✔️  updated user: ${userSnap.id} with "postsCount: ${dto.postsCount}" and "threadsCount: ${dto.threadsCount}"`
              );
            })
          );
        })
    );

    await Promise.allSettled(userTranUpdatePromises);

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
