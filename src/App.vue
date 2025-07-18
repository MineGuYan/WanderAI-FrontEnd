<script setup lang="ts">
import { onMounted } from 'vue';

function checkJWT() {
  const token = localStorage.getItem('token');
  if (!token) {
    return
  }

  const JWTsplit = token.split('.');

  if(JWTsplit.length !== 3) {
    console.log(1)
    localStorage.removeItem('token');
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      console.log(2)
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