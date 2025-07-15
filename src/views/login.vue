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
    alert("账号不能超过20个字符");
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
    <div class="login-form blur-bg">
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
</template>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-image: url('../assets/img/loginback1.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.login-form {
  max-width: 400px;
  max-height: 400px;
  width: 40%;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.35);
  position: relative;
  margin-top:80px;
  margin-left:100px;
  z-index: 2;
  transform: scale(0.8);
  /*添加transform属性，使登录表单在加载时缩小到80%*/
}

.login-form h1 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  font-size: 18px;
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
  margin-top: 15px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
  transform: translateY(0);
}

/* 鼠标悬停时的效果 */
.login-btn:hover {
  background-color: #0678d5;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  transform: translateY(-3px);
}

/* 按钮按下时的效果 */
.login-btn:active {
  background-color: #015cb9;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.3);
  transform: translateY(0);
  transition: all 0.1s ease;
}

/*添加蓝色聚焦环*/
.login-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
}

.register-link{
  margin-top: 30px;
}

.blur-bg {
  background-color: rgba(255, 255, 255, 0.6);
}
</style>