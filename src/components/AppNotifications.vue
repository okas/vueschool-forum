<script setup lang="ts">
import useNotifications from "../composables/useNotifications";

const { notifications, removeNotification } = useNotifications();
</script>

<template>
  <ul v-if="notifications?.size" class="notifications">
    <li v-for="[id, message] of notifications" :key="id" class="notification">
      <span v-text="message" />

      <button @click.prevent="removeNotification(id)">
        <fa icon="xmark" />
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.notifications {
  position: fixed;
  bottom: 1.5rem;
  right: 0.5rem;

  .notification {
    background-color: white;
    display: flex;
    justify-content: space-between;
    width: 20rem;
    box-shadow: 2px 2px 3px 2px rgba(0, 0, 148, 0.5);
    padding: 0.7rem 1.5rem;
    border-left: 0.25rem solid #263959;
  }

  .notification:not(:last-of-type) {
    margin-bottom: 0.5rem;
  }
}
</style>
