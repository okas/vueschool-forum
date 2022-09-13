import {
  arrayUnion,
  collection,
  doc,
  FieldValue,
  increment,
  serverTimestamp,
  writeBatch,
} from "@firebase/firestore";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { fabDb } from "../firebase";
import { threadVmConverter } from "../firebase/firebase-converters";
import { ThreadVM } from "../models/ThreadVM";
import {
  ThreadStoreActions,
  ThreadStoreGetters,
  ThreadStoreState,
} from "../types/thread-store-types";
import {
  ThreadVMEdit,
  ThreadVMNew,
  ThreadVMWithMeta,
} from "../types/threadVm-types";
import { countBy, findById } from "../utils/array-helpers";
import { ok } from "../utils/assert-helpers";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "./firebase-action-sinks";
import useAcceptHmr from "./helpers";
import { usePostStore } from "./post-store";
import { StoreBase } from "./store-base";
import { useUserStore } from "./user-store";

export const useThreadStore = defineStore(
  "thread-store",
  (): ThreadStoreState & ThreadStoreGetters & ThreadStoreActions => {
    const baseActions = new StoreBase();
    const { _dbUnsubscribes } = baseActions;

    const userStore = useUserStore();
    const postStore = usePostStore();

    const threads = reactive<Array<ThreadVM>>([]);

    const getThreadMetaInfoFn = computed(() => (threadId: string) => {
      const thread = findById(threads, threadId);
      ok(thread, `No thread with id: "${threadId}".`);

      const result: ThreadVMWithMeta = {
        ...thread,

        get authorName() {
          return findById(userStore.users, thread.userId)?.name ?? "<missing>";
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
      () => (id: string) => countBy(threads, ({ userId }) => userId === id)
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

      const threadRef = doc(collection(fabDb, "threads"));
      const forumRef = doc(fabDb, "forums", forumId);
      const userRef = doc(fabDb, "users", userStore.authUserId);

      await writeBatch(fabDb)
        .set(threadRef, threadDto)
        .update(forumRef, {
          threads: arrayUnion(threadRef.id),
        })
        .update(userRef, {
          threadsCount: increment(1),
        })
        .commit();

      // Guarantees, that next step, createPost has required data for it's job.
      await fetchThread(threadRef.id);

      // As `createPost` already fetches graph, there is no need to fetch
      // anymore nor update store manually.
      await postStore.createPost({ text, threadId: threadRef.id }, true);

      return threadRef.id;
    }

    async function editThread({ id: threadId, title, text }: ThreadVMEdit) {
      const thread = findById(threads, threadId);
      ok(thread, `Edit thread error: no thread with id: "${threadId}".`);
      ok(
        thread.firstPostId,
        `Edit thread error: thread: "${threadId}" is missing "firstPostId".`
      );

      const post = findById(postStore.posts, thread.firstPostId);
      ok(post, `Edit thread error: no post with id: ${thread.firstPostId}.`);

      const postRef = doc(fabDb, "posts", thread.firstPostId);
      const threadRef = doc(fabDb, "threads", threadId);

      await writeBatch(fabDb)
        .update(threadRef, { title })
        .update(postRef, {
          text,
          edited: {
            at: serverTimestamp(),
            by: userStore.authUserId,
            moderated: false,
          },
        })
        .commit();

      await Promise.allSettled([
        fetchThread(threadId),
        postStore.fetchPost(thread.firstPostId),
      ]);
    }

    const fetchThread = makeFirebaseFetchSingleDocFn(
      threads,
      "threads",
      _dbUnsubscribes,
      threadVmConverter
    );

    const fetchThreads = makeFirebaseFetchMultiDocsFn(
      threads,
      "threads",
      _dbUnsubscribes,
      threadVmConverter
    );

    return {
      threads,
      getThreadMetaInfoFn,
      getUserThreadsCountFn,
      createThread,
      editThread,
      fetchThread,
      fetchThreads,
      clearDbSubscriptions: () => baseActions.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(useThreadStore);

const CREATE_CONTENT_ERROR_MSG =
  "Create thread error: cannot proceed w/o authenticated user.";
