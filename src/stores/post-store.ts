import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type FieldValue,
} from "@firebase/firestore";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { fabDb } from "../firebase";
import { FabCollection } from "../firebase/firebase-collections-enum";
import { postVmConverter } from "../firebase/firebase-converters";
import type { PostVm } from "../models/PostVm";
import { nameForum } from "../types/forumVm-types";
import type {
  PostStoreActions,
  PostStoreGetters,
} from "../types/post-store-types";
import {
  namePost,
  type PostVMEdit,
  type PostVMNew,
} from "../types/postVm-types";
import type { StoreBaseState } from "../types/store-base-types";
import { nameThread } from "../types/threadVm-types";
import { nameUser } from "../types/userVm-types";
import { countBy, findById } from "../utils/array-helpers";
import { ok } from "../utils/assert-helpers";
import { FirebaseSubscriptionManager } from "../utils/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "../utils/store-firebase-action-sinks";
import useAcceptHmr from "../utils/store-helpers";
import { useThreadStore } from "./thread-store";
import { useUserStore } from "./user-store";

export const usePostStore = defineStore(
  "post-store",
  (): StoreBaseState<PostVm> & PostStoreGetters & PostStoreActions => {
    const fabSbscrMngr = new FirebaseSubscriptionManager();
    const { _dbUnsubscribes } = fabSbscrMngr;

    const threadStore = useThreadStore();
    const userStore = useUserStore();

    const items = reactive<Array<PostVm>>([]);

    const getUserPostsCountFn = computed(
      () => (id: string) => countBy(items, ({ userId }) => userId === id)
    );

    async function createPost(
      { threadId, ...rest }: PostVMNew,
      threadCreation = false
    ): Promise<string> {
      ok(userStore.authUserId, CREATE_CONTENT_ERROR_MSG);

      const thread = findById(threadStore.items, threadId);

      ok(thread, `Cannot get thread by id "${threadId}".`);

      const postRef = doc(collection(fabDb, FabCollection.posts));
      const threadRef = doc(fabDb, FabCollection.threads, threadId);
      const forumRef = doc(fabDb, FabCollection.forums, thread.forumId);
      const userRef = doc(fabDb, FabCollection.users, userStore.authUserId);

      const postDto: Omit<PostVm, "id" | "publishedAt"> & {
        publishedAt: FieldValue;
      } = {
        ...rest,
        threadId,
        userId: userStore.authUserId,
        publishedAt: serverTimestamp(),
      };

      await writeBatch(fabDb)
        .set(postRef, postDto)
        .update(threadRef, {
          [nameThread("posts")]: arrayUnion(postRef.id),
          [nameThread("lastPostAt")]: serverTimestamp(),
          [nameThread("contributors")]: arrayUnion(userStore.authUserId),
          [nameThread("lastPostId")]: postRef.id,
          ...(threadCreation && {
            [nameThread("firstPostId")]: postRef.id,
          }),
        })
        .update(forumRef, {
          [nameForum("lastPostId")]: postRef.id,
        })
        .update(userRef, {
          [nameUser("postsCount")]: increment(1),
        })
        .commit();

      await fetchPost(postRef.id);

      return postRef.id;
    }

    async function editPost({ id, text }: PostVMEdit) {
      const postRef = doc(fabDb, FabCollection.posts, id);

      return updateDoc(postRef, {
        text,
        [namePost("edited")]: {
          at: serverTimestamp(),
          by: userStore.authUserId,
          moderated: false,
        },
      });
    }

    const fetchPost = makeFirebaseFetchSingleDocFn(
      items,
      FabCollection.posts,
      _dbUnsubscribes,
      postVmConverter
    );

    const fetchPosts = makeFirebaseFetchMultiDocsFn(
      items,
      FabCollection.posts,
      _dbUnsubscribes,
      postVmConverter
    );

    async function fetchAllUserPosts(
      pageSize: number,
      lastFetchedPostId?: string
    ) {
      const constraints = [
        where(namePost("userId"), "==", userStore.authUserId),
        orderBy(namePost("publishedAt"), "desc"),
        limit(pageSize),
      ];

      if (lastFetchedPostId) {
        const startAfterDocSnap = await getDoc(
          doc(fabDb, FabCollection.posts, lastFetchedPostId)
        );
        constraints.splice(-1, 0, startAfter(startAfterDocSnap));
      }

      const docs = await getDocs(
        query(
          collection(fabDb, FabCollection.posts),
          ...constraints
        ).withConverter(postVmConverter)
      );

      docs.forEach((qryDocSnap) => {
        items.push(qryDocSnap.data());
      });
    }

    return {
      items,
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
