<script setup lang="ts">
import { useMainStore } from "../store";

const { name, avatar } = useMainStore().authUser;
</script>

<template>
  <header class="header" id="header">
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
        <li class="navbar-user">
          <a href="#">
            <img
              class="avatar-small"
              :src="avatar"
              :alt="`${name} profile picture`"
            />
            <span>
              {{ name }}
              <img
                class="icon-profile"
                src="../assets/svg/arrow-profile.svg"
                alt=""
              />
            </span>
          </a>

          <!-- dropdown menu -->
          <!-- add class "active-drop" to show the dropdown -->
          <div id="user-dropdown">
            <div class="triangle-drop"></div>
            <ul class="dropdown-menu">
              <li class="dropdown-menu-item">
                <a href="profile.html">View profile</a>
              </li>
              <li class="dropdown-menu-item"><a href="#">Log out</a></li>
            </ul>
          </div>
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
