<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user-store";
import { getProfileTitle } from "../utils/misc";

const userStore = useUserStore();
const router = useRouter();

const { getAuthUser } = storeToRefs(userStore);

const isUserDropDownOpen = ref(false);

const isMobNavMenuVisible = ref(false);

const avatarTitle = computed(() => getProfileTitle(getAuthUser.value.name));

router.beforeEach(() => closeMobNavMenu());

function toggleMobNavMenu() {
  isMobNavMenuVisible.value = !isMobNavMenuVisible.value;
}

function closeMobNavMenu() {
  isMobNavMenuVisible.value = false;
}

function toggleUserDropDown() {
  isUserDropDownOpen.value = !isUserDropDownOpen.value;
}

function closeDropDown() {
  isUserDropDownOpen.value = false;
}

async function signOut() {
  await userStore.signOut();
  router.push({ name: "Home" });
}
</script>

<template>
  <header
    id="header"
    v-click-outside="closeMobNavMenu"
    v-page-scroll="closeMobNavMenu"
    class="header"
  >
    <router-link class="logo" :to="{ name: 'Home' }">
      <img src="../assets/svg/vueschool-logo.svg" alt="logo" title="Home" />
    </router-link>

    <div class="btn-hamburger" @click.prevent="toggleMobNavMenu">
      <!-- use .btn-hamburger-active to open the menu -->
      <div class="top bar"></div>
      <div class="middle bar"></div>
      <div class="bottom bar"></div>
    </div>

    <nav class="navbar" :class="{ 'navbar-open': isMobNavMenuVisible }">
      <ul>
        <li v-if="getAuthUser" class="navbar-user">
          <a v-click-outside="closeDropDown" @click.prevent="toggleUserDropDown">
            <img
              v-if="getAuthUser.avatar"
              class="avatar-small"
              :src="getAuthUser.avatar"
              :title="avatarTitle"
            />
            <span>
              {{ getAuthUser.name }}
              <img class="icon-profile" src="../assets/svg/arrow-profile.svg" alt="" />
            </span>
          </a>

          <!-- dropdown menu -->
          <!-- add class "active-drop" to show the dropdown -->
          <div
            id="user-dropdown"
            :class="{
              'active-drop': isUserDropDownOpen,
            }"
          >
            <div class="triangle-drop"></div>
            <ul class="dropdown-menu">
              <li class="dropdown-menu-item">
                <router-link :to="{ name: 'Profile' }">View profile</router-link>
              </li>
              <li class="dropdown-menu-item">
                <a @click.prevent="signOut">Sign out</a>
              </li>
            </ul>
          </div>
        </li>

        <li v-if="!getAuthUser" class="navbar-item">
          <router-link :to="{ name: 'SignIn' }">Sign in</router-link>
        </li>
        <li v-if="!getAuthUser" class="navbar-item">
          <router-link :to="{ name: 'Register' }">Register</router-link>
        </li>

        <li v-if="getAuthUser" class="navbar-item mobile-only">
          <router-link :to="{ name: 'Profile' }">View profile</router-link>
        </li>
        <li v-if="getAuthUser" class="navbar-item mobile-only">
          <a @click.prevent="signOut">Sign out</a>
        </li>
      </ul>

      <!-- <ul>
        <li class="navbar-item">
          <a href="index.html">Home</a>
        </li>
        <li class="navbar-item">
          <a href="category.html">Category</a>
        </li>
        <li class="navbar-item">
          <a href="forum.html">Forum</a>
        </li>
        <li class="navbar-item">
          <a href="thread.html">Thread</a>
        </li>
      </ul> -->
    </nav>
  </header>
</template>

<style scoped>
/* nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
} */
</style>
