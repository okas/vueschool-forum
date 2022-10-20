//= ================
// clear && node firestore-fix-threads.js
//= ================

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import serviceAccount from "./service-account.json" assert { type: "json" };

const { log, warn, error } = console;

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

log("- ➡️  transaction start");

const threadsQuerySnap = await db.collection("threads").get();

/**
 * @typedef { {ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, dto: any, message: string} } UpdateData
 */

/**
 * @param {FirebaseFirestore.Transaction} transaction
 * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>} threadDocSnap
 * @returns {Promise< Array<UpdateData> | undefined>}
 */
async function getDataToFix(transaction, threadDocSnap) {
  {
    const threadDocData = threadDocSnap.data();
    const { ref } = threadDocSnap;

    /** @type { Array<string> | undefined } */
    const posts = threadDocData?.posts;

    if (!posts?.length) {
      log(
        `- ❕no posts: "${threadDocSnap.id}", fixes cannot be determined or might be unnecessary`
      );

      return;
    }

    /** @type { Array<UpdateData> } */
    const result = [];

    if (!threadDocData.firstPostId) {
      const firstPostId = posts[0];

      const message = `- ✔️  updated thread: "${threadDocSnap.id}", set "firstPostId": "${firstPostId}"`;

      result.push({
        ref,
        dto: { firstPostId },
        message,
      });
    }

    if (!threadDocData.lastPostId || !threadDocData.lastPostAt) {
      const lastPostIdToSearch = posts.length > 1 ? posts.at(-1) : posts[0];

      const lastPostDocSnap = await transaction.get(
        db.collection("posts").doc(lastPostIdToSearch)
      );

      if (!lastPostDocSnap.exists) {
        warn(
          `- ‼️  failed to fix thread 'last*' props: "${threadDocSnap.id}", last post ID "${lastPostIdToSearch}" do not exist in posts collection, skip"`
        );

        return result;
      }

      const dto = {
        lastPostId: lastPostDocSnap.id,
        lastPostAt: convertToTimeStamp(lastPostDocSnap.data().publishedAt),
      };

      const message = `- ✔️  updated thread: "${
        threadDocSnap.id
      }", set "lastPostId": "${
        dto.lastPostId
      }" & "lastPostAt" (here as Date): "${convertToDate(dto.lastPostAt)}"`;

      result.push({
        ref,
        dto,
        message,
      });
    }

    return result.length ? result : undefined;
  }
}

/**
 * @param {FirebaseFirestore.Transaction} transaction
 * @param {UpdateData} param0
 * @returns {Promise<void>}
 */
async function fixData(transaction, { ref, dto, message }) {
  transaction.update(ref, dto);

  log(message);
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
      const updateData = await Promise.all(
        threadsQuerySnap.docs.map(async (threadDocSnap) =>
          getDataToFix(tran, threadDocSnap)
        )
      );

      return Promise.all(
        updateData
          .filter((x) => x)
          .flat()
          .map((data) => fixData(tran, data))
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
