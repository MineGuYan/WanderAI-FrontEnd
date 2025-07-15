<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '../api/request.ts';
import { useRouter } from "vue-router";
import { sha256 } from 'js-sha256'

const userid = ref('');
const password = ref('');

watch(userid, (newValue) => {
  if( newValue.length > 12) {

  } else {

  }

  if (newValue.length > 20) {
    userid.value = newValue.slice(0, 20);
  }
});

watch(password, (newValue) => {
  if( newValue.length > 6) {

  } else {

  }

  if (newValue.length > 15) {
    password.value = newValue.slice(0, 15);
    alert("密码不能超过15个字符");
  }
});

async function login() {
  if (userid.value === '' || password.value === '') {
    alert('账号和密码不能为空');
    return;
  }

  const encryptedPassword = sha256(password.value)

  try {
    const response = await api.post('/user/login', {
      accountId: userid.value,
      password: encryptedPassword,
    });

    if (response.data.code === 1) {
      localStorage.setItem('token', response.data.data.token);
      alert(`欢迎，${response.data.data.nickname}！`);
      // 登录成功后可以跳转到其他页面
      await useRouter().push('/home');
    } else {
      alert('登录失败，请稍后再试');
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    alert('登录请求失败，请稍后再试');
  }
}
</script>

<template>
  <div>
    <h1>登录</h1>
<!--    <form @submit.prevent="login">-->
    <form>
      <div>
        <label for="userid">账号：</label>
        <input type="text" id="userid" v-model="userid" placeholder="请输入账号..." required />
      </div>
      <div>
        <label for="password">密码：</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码..." required />
      </div>
      <button @click="login">登录</button>
      <router-link to="/register">注册新用户</router-link>
    </form>
  </div>
</template>

<style scoped>

</style>