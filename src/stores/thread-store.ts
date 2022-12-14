import { fabDb } from "@/firebase";
import { FabCollection } from "@/firebase/firebase-collections-enum";
import { threadVmConverter } from "@/firebase/firebase-converters";
import {
  getForumDocRef,
  getPostDocRef,
  getStatsDocRef,
  getThreadColRef,
  getThreadDocRef,
  getUserDocRef,
} from "@/firebase/firebase-get-refs";
import { FirebaseSubscriptionManager } from "@/firebase/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "@/firebase/store-firebase-action-sinks";
import type { ThreadVM } from "@/models/ThreadVM";
import type { StoreBaseState } from "@/types/store-base-types";
import type {
  ThreadStoreActions,
  ThreadStoreGetters,
} from "@/types/thread-store-types";
import type {
  ThreadVMEdit,
  ThreadVMNew,
  ThreadVMWithMeta,
} from "@/types/threadVm-types";
import { countBy, findById } from "@/utils/array-helpers";
import { ok } from "@/utils/assert-helpers";
import {
  nameForum,
  namePost,
  nameStats,
  nameUser,
} from "@/utils/model-member-name-helpers";
import useAcceptHmr from "@/utils/store-helpers";
import {
  arrayUnion,
  doc,
  increment,
  serverTimestamp,
  writeBatch,
  type FieldValue,
} from "@firebase/firestore";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { usePostStore } from "./post-store";
import { useUserStore } from "./user-store";

export const useThreadStore = defineStore(
  "thread-store",
  (): StoreBaseState<ThreadVM> & ThreadStoreGetters & ThreadStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;

    const userStore = useUserStore();
    const postStore = usePostStore();

    const items = reactive<Array<ThreadVM>>([]);

    const getThreadMetaInfoFn = computed(() => (threadId: string) => {
      const thread = findById(items, threadId);
      ok(thread, `No thread with id: "${threadId}".`);

      const result: ThreadVMWithMeta = {
        ...thread,

        get authorName() {
          return findById(userStore.items, thread.userId)?.name ?? "<missing>";
        },

        get repliesCount() {
          return thread.posts.length - 1;
        },

        get contributorsCount() {
          return new Set(thread.contributors).size;
        },
      };

      return result;
    });

    const getUserThreadsCountFn = computed(
      () => (id: string) => countBy(items, ({ userId }) => userId === id)
    );

    async function createThread({
      text,
      forumId,
      ...rest
    }: ThreadVMNew): Promise<string> {
      ok(userStore.authUserId, CREATE_CONTENT_ERROR_MSG);

      const threadDto: Omit<
        ThreadVM,
        "id" | "publishedAt" | "lastPostAt" | "firstPostId" | "lastPostId"
      > & {
        publishedAt: FieldValue;
        lastPostAt: FieldValue;
      } = {
        ...rest,
        forumId,
        userId: userStore.authUserId,
        publishedAt: serverTimestamp(),
        lastPostAt: serverTimestamp(),
        posts: [],
        contributors: [userStore.authUserId],
        slug: "",
      };

      const threadRef = doc(getThreadColRef());
      const forumRef = getForumDocRef(forumId);
      const userRef = getUserDocRef(userStore.authUserId);
      const statsRef = getStatsDocRef();

      await writeBatch(fabDb)
        .set(threadRef, threadDto)
        .update(forumRef, { [nameForum("threads")]: arrayUnion(threadRef.id) })
        .update(userRef, { [nameUser("threadsCount")]: increment(1) })
        .update(statsRef, { [nameStats("threadsCount")]: increment(1) })
        .commit();

      // Guarantees, that next step, createPost has required data for it's job.
      await fetchThread(threadRef.id);

      // As `createPost` already fetches graph, there is no need to fetch
      // anymore nor update store manually.
      await postStore.createPost({ text, threadId: threadRef.id }, true);

      return threadRef.id;
    }

    async function editThread({ id: threadId, title, text }: ThreadVMEdit) {
      const thread = findById(items, threadId);
      ok(thread, `Edit thread error: no thread with id: "${threadId}".`);
      ok(
        thread.firstPostId,
        `Edit thread error: thread: "${threadId}" is missing "firstPostId".`
      );

      const postRef = getPostDocRef(thread.firstPostId);
      const threadRef = getThreadDocRef(threadId);

      await writeBatch(fabDb)
        .update(threadRef, { title })
        .update(postRef, {
          text,
          [namePost("edited")]: {
            at: serverTimestamp(),
            by: userStore.authUserId,
            moderated: false,
          },
        })
        .commit();
    }

    const fetchThread = makeFirebaseFetchSingleDocFn(
      items,
      FabCollection.threads,
      _dbUnsubscribes,
      threadVmConverter
    );

    const fetchThreads = makeFirebaseFetchMultiDocsFn(
      items,
      FabCollection.threads,
      _dbUnsubscribes,
      threadVmConverter
    );

    async function fetchThreadsByPage(
      page: number,
      pageSize: number,
      ids: Array<string> = []
    ): Promise<Array<ThreadVM>> {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return fetchThreads(ids.slice(start, end));
    }

    return {
      items,
      getThreadMetaInfoFn,
      getUserThreadsCountFn,
      createThread,
      editThread,
      fetchThread,
      fetchThreads,
      fetchThreadsByPage,
      clearDbSubscriptions: () => fabSbscrMngr.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useThreadStore);

const CREATE_CONTENT_ERROR_MSG =
  "Create thread error: cannot proceed w/o authenticated user.";
