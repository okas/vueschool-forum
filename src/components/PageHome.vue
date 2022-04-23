<template>
  <div v-for="t in threads" :key="t.id" class="col-large push-top">
    <!-- <ul class="breadcrumbs">
      <li>
        <a href="#"><i class="fa fa-home fa-btn"></i>Home</a>
      </li>
      <li><a href="category.html">Discussions</a></li>
      <li class="active"><a href="#">Cooking</a></li>
    </ul> -->

    <h1 v-text="t.title" />

    <!-- <p>
      By <a href="#" class="link-unstyled">Robin</a>, 2 hours ago.
      <span
        style="float: right; margin-top: 2px"
        class="hide-mobile text-faded text-small"
        >3 replies by 3 contributors</span
      >
    </p> -->

    <div class="post-list">
      <div v-for="postId in t.posts" :key="postId" class="post">
        <div class="user-info">
          <a
            v-text="userById(postById(postId).userId).name"
            href="#"
            class="user-name"
          />
          <!-- <a  v-text="userById(postById(postId).userId).name" href="profile.html#profile-details" class="user-name"></a> -->

          <a href="#">
            <!-- <a href="profile.html#profile-details"> -->
            <img
              class="avatar-large"
              :src="userById(postById(postId).userId).avatar"
              alt=""
            />
          </a>

          <p class="desktop-only text-small">107 posts</p>

          <!-- <p class="desktop-only text-small">23 threads</p>
          <span class="online desktop-only">online</span> -->
        </div>

        <div class="post-content">
          <div>
            <p v-text="postById(postId).text" />
          </div>
          <!-- <a
            href="#"
            style="margin-left: auto"
            class="link-unstyled"
            title="Make a change"
            ><i class="fa fa-pencil"></i
          ></a> -->
        </div>

        <div
          v-text="postById(postId).publishedAt"
          class="post-date text-faded"
        />

        <!-- <div class="reactions">
          <ul>
            <li>💡</li>
            <li>❤️</li>
            <li>👎</li>
            <li>👍</li>
            <li>👌</li>
          </ul>
          <button class="btn-xsmall"><span class="emoji">❤️</span>️ 3</button>
          <button class="btn-xsmall active-reaction">
            <span class="emoji">👌️</span>️ 1
          </button>
          <button class="btn-xsmall">
            + <i class="fa fa-smile-o emoji"></i>
          </button>
        </div>
      </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { threads, posts, users } from "../data.json";

function postById(pId) {
  return posts.find(({ id }) => id === pId);
}

function userById(uId) {
  return users.find(({ id }) => id === uId);
}
</script>

<style scoped></style>
