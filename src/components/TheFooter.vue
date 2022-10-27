<script setup lang="ts">
import { useCommonStore } from "@/stores/common-store";
import { storeToRefs } from "pinia";

const { stats } = storeToRefs(useCommonStore());
</script>

<template>
  <footer class="app-footer desktop-only">
    <div class="forum-stats">
      <ul>
        <li>
          <fa class="fa" icon="user-circle"></fa>{{ stats?.usersOnline ?? "no" }} users
          online
        </li>
        <li>
          <fa class="fa" icon="user"></fa>{{ stats?.usersCount ?? "no" }} users registered
        </li>
        <li>
          <fa class="fa" icon="comments"></fa>{{ stats?.threadsCount ?? "no" }} threads
        </li>
        <li><fa class="fa" icon="comment"></fa>{{ stats?.postsCount ?? "no" }} posts</li>
      </ul>
    </div>
  </footer>
</template>

<style>
#app > main {
  margin-bottom: 6rem;
}
</style>

<style scoped lang="scss">
.app-footer {
  bottom: 0;
  height: 4rem;
  position: fixed;
  width: 100%;
  background-color: aliceblue;
}

.forum-stats ul {
  margin: 1rem !important;
}
</style>
