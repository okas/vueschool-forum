//= ================
// clear && node -r dotenv/config firestore-fix-thread.js dotenv_config_path=.env.local
//= ================

import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  runTransaction,
} from "firebase/firestore";
import firebaseConfig from "./src/config/firebase.js";

const { log } = console;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

log("- transaction start");

const threadsQuerySnap = await getDocs(collection(db, "threads"));

await runTransaction(db, async (tran) => {
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
            `- updated thread: ${threadDocSnap.id} with fixed "firstPostId: ${dto.firstPostId}"`
          );
        }

        resolve();
      })
  );

  await Promise.allSettled(threadTranUpdatePromises);

  log("- all updates done");
});

log("- transaction done");

process.exit();
