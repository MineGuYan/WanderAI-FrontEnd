<script setup lang="ts">
import { ref } from 'vue';

const userid = ref('');
const password = ref('');
</script>

<template>
  <div>
    <h1>登录</h1>
<!--    <form @submit.prevent="login">-->
    <form>
      <div>
        <label for="userid">账号：</label>
        <input type="number" id="userid" v-model="userid" placeholder="请输入账号..." required />
      </div>
      <div>
        <label for="password">密码：</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码..." required />
      </div>
      <button type="submit">登录</button>
      <router-link to="/register">注册新用户</router-link>
    </form>
  </div>
</template>

<style scoped>

</style>