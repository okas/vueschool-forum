import { fabDb } from "@/firebase";
import { FabCollection } from "@/firebase/firebase-collections-enum";
import { postVmConverter } from "@/firebase/firebase-converters";
import {
  getForumDocRef,
  getPostColRef,
  getPostDocRef,
  getStatsDocRef,
  getThreadDocRef,
  getUserDocRef,
} from "@/firebase/firebase-get-refs";
import { FirebaseSubscriptionManager } from "@/firebase/FirebaseSubscriptionManager";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "@/firebase/store-firebase-action-sinks";
import type { PostVm } from "@/models/PostVm";
import type {
  PostStoreActions,
  PostStoreGetters,
} from "@/types/post-store-types";
import type { PostVMEdit, PostVMNew } from "@/types/postVm-types";
import type { StoreBaseState } from "@/types/store-base-types";
import { countBy, findById } from "@/utils/array-helpers";
import { ok } from "@/utils/assert-helpers";
import {
  nameForum,
  namePost,
  nameStats,
  nameThread,
  nameUser,
} from "@/utils/model-member-name-helpers";
import useAcceptHmr from "@/utils/store-helpers";
import {
  arrayUnion,
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

      const postRef = doc(getPostColRef());
      const threadRef = getThreadDocRef(threadId);
      const forumRef = getForumDocRef(thread.forumId);
      const userRef = getUserDocRef(userStore.authUserId);
      const statsRef = getStatsDocRef();

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
        .update(forumRef, { [nameForum("lastPostId")]: postRef.id })
        .update(userRef, { [nameUser("postsCount")]: increment(1) })
        .update(statsRef, { [nameStats("postsCount")]: increment(1) })
        .commit();

      await fetchPost(postRef.id);

      return postRef.id;
    }

    async function editPost({ id, text }: PostVMEdit) {
      const postRef = getPostDocRef(id);

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
          getPostDocRef(lastFetchedPostId)
        );
        constraints.splice(-1, 0, startAfter(startAfterDocSnap));
      }

      const docs = await getDocs(
        query(getPostColRef(), ...constraints).withConverter(postVmConverter)
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
