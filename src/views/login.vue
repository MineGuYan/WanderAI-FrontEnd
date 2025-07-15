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
  <div class="login-container">
    <!-- 左侧登录表单 -->
    <div class="left-side">
      <div class="login-form">
        <h1>登录</h1>
        <form>
          <div class="form-group">
            <label for="userid">账号：</label>
            <input type="text" id="userid" v-model="userid" placeholder="请输入账号..." required />
          </div>
          <div class="form-group">
            <label for="password">密码：</label>
            <input type="password" id="password" v-model="password" placeholder="请输入密码..." required />
          </div>
          <button @click="login" type="button" class="login-btn">登录</button>
          <router-link to="/register" class="register-link">注册新用户</router-link>
        </form>
      </div>
    </div>

    <!-- 右侧背景图片 -->
    <div class="right-side">
      <img src="../assets/img/Login-leftbkg.png" alt="登录背景" class="background-image" />
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.left-side {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right-side {
  flex: 1;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.login-form {
  max-width: 400px;
  width: 80%;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-form h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  transition: background-color 0.2s;
}

</style>