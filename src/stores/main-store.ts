import {
  arrayUnion,
  collection,
  doc,
  FieldValue,
  getDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "@firebase/firestore";
import { ok } from "assert";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import {
  postVmConverter,
  threadVmConverter,
  userVmConverter,
} from "../firebase/firebase-converters";
import { CategoryVM } from "../models/CategoryVM";
import { ForumVM } from "../models/ForumVM";
import { PostVm } from "../models/PostVm";
import { StatsVM } from "../models/StatsVM";
import { ThreadVM } from "../models/ThreadVM";
import { UserVM } from "../models/UserVM";
import {
  MainStoreActions,
  MainStoreGetters,
  MainStoreState,
} from "../types/main-store-types";
import { PostVMNew } from "../types/postVm-types";
import {
  ThreadVMEdit,
  ThreadVMNew,
  ThreadVMWithMeta,
} from "../types/threadVm-types";
import { UserVMWithActivity } from "../types/userVm-types";
import { countBy, findById, upsert } from "../utils/array-helpers";
import { firestoreDb as db } from "./../firebase/index";
import {
  makeFirebaseFetchMultiDocsFn,
  makeFirebaseFetchSingleDocFn,
} from "./firebase-action-sinks";

const { warn } = console;

export const useMainStore = defineStore(
  "main",
  (): MainStoreState & MainStoreGetters & MainStoreActions => {
    // --------------------------
    //        STATE
    // --------------------------
    const authUserId = ref("Qc4Pz_28PEqITnCQ21T6Vw");

    const categories = reactive<Array<CategoryVM>>([]);
    const forums = reactive<Array<ForumVM>>([]);
    const posts = reactive<Array<PostVm>>([]);
    const threads = reactive<Array<ThreadVM>>([]);
    const users = reactive<Array<UserVM>>([]);
    const stats = reactive<StatsVM>({
      postsCount: 0,
      threadsCount: 0,
      usersCount: 0,
      usersOnline: 0,
    });

    // --------------------------
    //        GETTERS
    // --------------------------

    const getAuthUser = computed(() => getUserByIdFn.value(authUserId.value));

    const getUserByIdFn = computed(() => (id: string) => {
      const user = findById(users, id);

      if (!user) {
        warn(`Cannot get user by id "${id}".`);
        return;
      }

      const result: UserVMWithActivity = {
        ...user,

        get posts() {
          return posts.filter(({ userId }) => userId === id);
        },

        get threads() {
          return threads.filter(({ userId }) => userId === id);
        },

        get postsCount() {
          return this.posts?.length ?? 0;
        },

        get threadsCount() {
          return this.threads.length ?? 0;
        },
      };

      return result;
    });

    const getUserPostsCountFn = computed(
      () => (id: string) => countBy(posts, ({ userId }) => userId === id)
    );

    const getUserThreadsCountFn = computed(
      () => (id: string) => countBy(threads, ({ userId }) => userId === id)
    );

    const getThreadMetaInfoFn = computed(() => (threadId: string) => {
      const thread = findById(threads, threadId);
      ok(thread, `No thread with id: "${threadId}".`);

      const result: ThreadVMWithMeta = {
        ...thread,

        get authorName() {
          return findById(users, thread.userId)?.name ?? "<missing>";
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

    const getCategoryNamedFn = computed(
      () => (categoryId: string) => findById(categories, categoryId)?.name
    );

    // --------------------------
    //        ACTIONS
    // --------------------------

    async function editUser(dto: UserVM) {
      Object.assign(users[users.findIndex(({ id }) => id === dto.id)], dto);
    }

    async function createPost({
      threadId,
      ...rest
    }: PostVMNew): Promise<string> {
      const postDto: Omit<PostVm, "id" | "publishedAt"> & {
        publishedAt: FieldValue;
      } = {
        ...rest,
        threadId,
        userId: authUserId.value,
        publishedAt: serverTimestamp(),
      };

      const thread = threads.find(({ id }) => id === threadId)!;

      const postRef = doc(collection(db, "posts"));
      const threadRef = doc(db, "threads", threadId);
      const forumRef = doc(db, "forums", thread.forumId);

      await writeBatch(db)
        .set(postRef, postDto)
        .update(threadRef, {
          posts: arrayUnion(postRef.id),
          lastPostAt: serverTimestamp(),
          contributors: arrayUnion(authUserId.value),
          lastPostId: postRef.id,
        })
        .update(forumRef, {
          lastPostId: postRef.id,
        })
        .commit();

      const newPost = (
        await getDoc(postRef.withConverter(postVmConverter))
      ).data()!;

      posts.push(newPost);

      thread.lastPostAt = newPost.publishedAt;
      thread.lastPostId = postRef.id;

      tryAppendPostToThreadOrThrow(threadId, postRef.id);
      tryAppendContributorToThreadOrThrow(threadId, authUserId.value);

      return postRef.id;
    }

    async function createThread({
      text,
      forumId,
      ...rest
    }: ThreadVMNew): Promise<string> {
      const dto: Omit<
        ThreadVM,
        "id" | "publishedAt" | "lastPostAt" | "firstPostId" | "lastPostId"
      > & {
        publishedAt: FieldValue;
        lastPostAt: FieldValue;
      } = {
        ...rest,
        forumId,
        userId: authUserId.value,
        publishedAt: serverTimestamp(),
        lastPostAt: serverTimestamp(),
        posts: [],
        contributors: [authUserId.value],
        slug: "",
      };

      const threadRef = doc(collection(db, "threads"));
      const forumRef = doc(db, "forums", forumId);

      await writeBatch(db)
        .set(threadRef, dto)
        .update(forumRef, {
          threads: arrayUnion(threadRef.id),
        })
        .commit();

      const newThread = (
        await getDoc(threadRef.withConverter(threadVmConverter))
      ).data();

      upsert(threads, newThread!);

      const firstPostId = await createPost({ text, threadId: threadRef.id });

      await updateDoc(threadRef, { firstPostId });

      tryAppendThreadToForumOrThrow(forumId, threadRef.id);

      return threadRef.id;
    }

    async function editThread({ id: threadId, title, text }: ThreadVMEdit) {
      const thread = findById(threads, threadId);
      ok(thread, `Edit thread error: no thread with id: "${threadId}".`);

      const post = findById(posts, thread.posts[0]);
      ok(post, `Edit thread error: no post with id: ${thread.posts[0]}.`);

      thread.title = title;
      post.text = text;
    }

    const fetchThread = makeFirebaseFetchSingleDocFn(
      threads,
      "threads",
      threadVmConverter
    );

    const fetchUser = makeFirebaseFetchSingleDocFn(
      users,
      "users",
      userVmConverter
    );

    const fetchPost = makeFirebaseFetchSingleDocFn(
      posts,
      "posts",
      postVmConverter
    );

    const fetchForum = makeFirebaseFetchSingleDocFn(forums, "forums");

    const fetchCategory = makeFirebaseFetchSingleDocFn(
      categories,
      "categories"
    );

    const fetchThreads = makeFirebaseFetchMultiDocsFn(
      threads,
      "threads",
      threadVmConverter
    );

    const fetchUsers = makeFirebaseFetchMultiDocsFn(
      users,
      "users",
      userVmConverter
    );

    const fetchPosts = makeFirebaseFetchMultiDocsFn(
      posts,
      "posts",
      postVmConverter
    );

    const fetchForums = makeFirebaseFetchMultiDocsFn(forums, "forums");

    function fetchAllCategories() {
      return makeFirebaseFetchMultiDocsFn(categories, "categories")();
    }

    function fetchAuthUser() {
      return makeFirebaseFetchSingleDocFn(
        users,
        "users",
        userVmConverter
      )(authUserId.value);
    }

    // --------------------------
    //        __ INTERNALS __
    // --------------------------

    const tryAppendPostToThreadOrThrow = _makeParentChildUniqueAppenderFn(
      threads,
      "posts"
    );

    const tryAppendThreadToForumOrThrow = _makeParentChildUniqueAppenderFn(
      forums,
      "threads"
    );

    const tryAppendContributorToThreadOrThrow =
      _makeParentChildUniqueAppenderFn(threads, "contributors");

    return {
      // STATE

      authUserId,
      categories,
      forums,
      posts,
      threads,
      users,
      stats,

      // GETTERS

      getAuthUser,
      getUserByIdFn,
      getUserPostsCountFn,
      getUserThreadsCountFn,
      getThreadMetaInfoFn,
      getCategoryNamedFn,

      // ACTIONS

      editUser,
      createPost,
      createThread,
      editThread,
      fetchThread,
      fetchUser,
      fetchPost,
      fetchForum,
      fetchCategory,
      fetchThreads,
      fetchUsers,
      fetchPosts,
      fetchForums,
      fetchAllCategories,
      fetchAuthUser,
    };
  }
);

function _makeParentChildUniqueAppenderFn<
  TId,
  TParent extends { id: TId } & Record<string, unknown>,
  PropChild extends keyof TParent
>(array: Array<TParent>, childArrayProp: PropChild) {
  return <TAppendValue>(parentId: TId, ...appendValue: Array<TAppendValue>) => {
    const parent = findById(array, parentId);

    ok(parent, `Append error: non-existing parent.`);

    const childArray = parent[childArrayProp] as Array<TAppendValue>;

    if (!childArray) {
      (parent[childArrayProp] as Array<TAppendValue>) = [...appendValue];
    } else {
      appendValue.forEach(
        (val) => !childArray.includes(val) && childArray.push(val)
      );
    }
  };
}
