<template>
  <footer class="app-footer desktop-only">
    <div class="forum-stats">
      <ul>
        <li><fa class="fa" icon="user-circle"></fa>47 users online</li>
        <li><fa class="fa" icon="user"></fa>497 users registered</li>
        <li><fa class="fa" icon="comments"></fa>49 threads</li>
        <li><fa class="fa" icon="comment"></fa>763 posts</li>
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
