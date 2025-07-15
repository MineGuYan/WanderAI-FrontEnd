<script setup lang="ts">
import { ref, watch } from "vue";
import api from '../api/request.ts';
import { useRouter } from "vue-router";
import { sha256 } from 'js-sha256'

const username = ref('')
const password = ref('')

watch(username, (newValue) => {
  if (newValue.length > 20) {
    username.value = newValue.slice(0, 20);
    alert("昵称不能超过20个字符");
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

async function register() {
  if (username.value === '' || password.value === '') {
    alert('昵称和密码不能为空');
    return;
  }

  const encryptedPassword = sha256(password.value)

  try {
    const response = await api.post('/user/register', {
      nickname: username.value,
      password: encryptedPassword,
    });

    if (response.data.code === 1) {
      alert('注册成功！\n您的账号为：' + response.data.data.accountId);
      await useRouter().push('/login');
    } else {
      alert('注册失败，请稍后再试');
    }
  } catch (error) {
    console.error('注册请求失败:', error);
    alert('注册请求失败，请稍后再试');
  }
}
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
      <button @click="register">注册</button>
      <router-link to="/login">已有账号，返回登录</router-link>
    </form>
  </div>
</template>

<style scoped>

</style>