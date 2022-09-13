<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useUserStore } from "../stores/user-store";

const userStore = useUserStore();

const { getAuthUser } = storeToRefs(userStore);

const isUserDropDownOpen = ref(false);

function toggleUserDropDown() {
  isUserDropDownOpen.value = !isUserDropDownOpen.value;
}

async function signOut() {
  await userStore.signOut();
}
</script>

<template>
  <header id="header" class="header">
    <router-link class="logo" :to="{ name: 'Home' }">
      <img src="../assets/svg/vueschool-logo.svg" alt="logo" title="Home" />
    </router-link>

    <div class="btn-hamburger">
      <!-- use .btn-hamburger-active to open the menu -->
      <div class="top bar"></div>
      <div class="middle bar"></div>
      <div class="bottom bar"></div>
    </div>

    <!-- use .navbar-open to open nav -->
    <nav class="navbar">
      <ul>
        <li v-if="getAuthUser" class="navbar-user">
          <a @click.prevent="toggleUserDropDown">
            <img
              v-if="getAuthUser.avatar"
              class="avatar-small"
              :src="getAuthUser.avatar"
              :alt="`${getAuthUser.name} profile picture`"
            />
            <span>
              {{ getAuthUser.name }}
              <img
                class="icon-profile"
                src="../assets/svg/arrow-profile.svg"
                alt=""
              />
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
                <router-link :to="{ name: 'Profile' }">
                  View profile
                </router-link>
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
        </li> -->
      <!-- Show these option only on mobile-->
      <!-- <li class="navbar-item mobile-only">
          <a href="profile.html">My Profile</a>
        </li>
        <li class="navbar-item mobile-only">
          <a href="#">Logout</a>
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
