<script setup lang="ts">
import {ref} from "vue";

const username = ref('')
const password = ref('')
</script>

<template>
  <div>
    <h1>注册</h1>
    <form>
      <div>
        <label for="username">昵称：</label>
        <input type="text" id="username" v-model="username" placeholder="请输入用户昵称..." required>
      </div>
      <div>
        <label for="password">密码：</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码..." required />
      </div>
      <button>注册</button>
      <router-link to="/login">已有账号，返回登录</router-link>
    </form>
  </div>
</template>

<style scoped>

</style>