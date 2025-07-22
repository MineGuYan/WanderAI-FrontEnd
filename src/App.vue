<script setup lang="ts">
import { onMounted } from 'vue';

function checkJWT() {
  const token = localStorage.getItem('token');
  if (!token) {
    return
  }

  const JWTsplit = token.split('.');

  if(JWTsplit.length !== 3) {
    localStorage.removeItem('token');
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload.accountId || payload.accountId !== localStorage.getItem('accountId')) {
      localStorage.removeItem('token');
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      localStorage.removeItem('token');
    }
  } catch (error) {
    console.error('Invalid JWT token:', error);
    localStorage.removeItem('token');
  }

}

onMounted(() => {
  checkJWT()
});
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>