import {
  arrayUnion,
  collection,
  doc,
  FieldValue,
  getDocs,
  increment,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "@firebase/firestore";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { fabDb } from "../firebase";
import { postVmConverter } from "../firebase/firebase-converters";
import { PostVm } from "../models/PostVm";
import {
  PostStoreActions,
  PostStoreGetters,
  PostStoreState,
} from "../types/post-store-types";
import { PostVMEdit, PostVMNew } from "../types/postVm-types";
import { countBy, findById } from "../utils/array-helpers";
import { ok } from "../utils/assert-helpers";
import { FirebaseSubscriptionManager } from "../utils/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "../utils/store-firebase-action-sinks";
import useAcceptHmr from "../utils/store-helpers";
import { useForumStore } from "./forum-store";
import { useThreadStore } from "./threads-store";
import { useUserStore } from "./user-store";

export const usePostStore = defineStore(
  "post-store",
  (): PostStoreState & PostStoreGetters & PostStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;

    const threadStore = useThreadStore();
    const userStore = useUserStore();
    const forumStore = useForumStore();

    const posts = reactive<Array<PostVm>>([]);

    const getUserPostsCountFn = computed(
      () => (id: string) => countBy(posts, ({ userId }) => userId === id)
    );

    async function createPost(
      { threadId, ...rest }: PostVMNew,
      threadCreation = false
    ): Promise<string> {
      ok(userStore.authUserId, CREATE_CONTENT_ERROR_MSG);

      const postDto: Omit<PostVm, "id" | "publishedAt"> & {
        publishedAt: FieldValue;
      } = {
        ...rest,
        threadId,
        userId: userStore.authUserId,
        publishedAt: serverTimestamp(),
      };

      const thread = findById(threadStore.threads, threadId);

      ok(thread, `Cannot get thread by id "${threadId}".`);

      const postRef = doc(collection(fabDb, "posts"));
      const threadRef = doc(fabDb, "threads", threadId);
      const forumRef = doc(fabDb, "forums", thread.forumId);
      const userRef = doc(fabDb, "users", userStore.authUserId);

      await writeBatch(fabDb)
        .set(postRef, postDto)
        .update(threadRef, {
          posts: arrayUnion(postRef.id),
          lastPostAt: serverTimestamp(),
          contributors: arrayUnion(userStore.authUserId),
          lastPostId: postRef.id,
          ...(threadCreation && {
            firstPostId: postRef.id,
          }),
        })
        .update(forumRef, {
          lastPostId: postRef.id,
        })
        .update(userRef, {
          postsCount: increment(1),
        })
        .commit();

      await Promise.allSettled([
        fetchPost(postRef.id),
        threadStore.fetchThread(threadId),
        forumStore.fetchForum(forumRef.id),
        userStore.fetchUser(userStore.authUserId),
      ]);

      return postRef.id;
    }

    async function editPost({ id, text }: PostVMEdit) {
      const postRef = doc(fabDb, "posts", id);

      await writeBatch(fabDb)
        .update(postRef, {
          text,
          edited: {
            at: serverTimestamp(),
            by: userStore.authUserId,
            moderated: false,
          },
        })
        .commit();

      await fetchPost(id);
    }

    const fetchPost = makeFirebaseFetchSingleDocFn(
      posts,
      "posts",
      _dbUnsubscribes,
      postVmConverter
    );

    const fetchPosts = makeFirebaseFetchMultiDocsFn(
      posts,
      "posts",
      _dbUnsubscribes,
      postVmConverter
    );

    async function fetchAllUserPosts() {
      (
        await getDocs(
          query(
            collection(fabDb, "posts"),
            where("userId", "==", userStore.authUserId)
          ).withConverter(postVmConverter)
        )
      ).forEach((qryDocSnap) => {
        posts.push(qryDocSnap.data());
      });
    }

    return {
      posts,
      getUserPostsCountFn,
      createPost,
      editPost,
      fetchPost,
      fetchPosts,
      fetchAllUserPosts,
      clearDbSubscriptions: () => fabSbscrMngr.clearDbSubscriptions(),
    };
  }
);

useAcceptHmr(usePostStore);

const CREATE_CONTENT_ERROR_MSG =
  "Create post error: cannot proceed w/o authenticated user.";
