<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '../api/request.ts';
import { sha256 } from 'js-sha256'
import {ElMessageBox} from "element-plus";
// @ts-ignore
import AspectRatioBox from "../components/AspectRatioBox.vue";

const userid = ref('');
const password = ref('');

watch(userid, (newValue) => {
  if( newValue.length > 12) {

  } else {

  }

  if (newValue.length > 20) {
    userid.value = newValue.slice(0, 20);
    ElMessageBox.alert('账号不能超过20个字符', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
});

watch(password, (newValue) => {
  if( newValue.length > 6) {
  } else {
  }

  if (newValue.length > 15) {
    password.value = newValue.slice(0, 15);
    ElMessageBox.alert('密码不能超过15个字符', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
});

async function login() {
  if (userid.value === '' || password.value === '') {
    await ElMessageBox.alert('账号和密码不能为空', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
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
      localStorage.setItem('nickname', response.data.data.nickname);
      localStorage.setItem('accountId', userid.value);
      await ElMessageBox.alert(`欢迎，${response.data.data.nickname}！`, '提示', {
        confirmButtonText: '确定',
        type: 'success'
      });
      // 登录成功后可以跳转到其他页面
      window.location.href = "/";
    } else {
      await ElMessageBox.alert('登录失败，请稍后再试', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      });
    }
  } catch (error) {
    await ElMessageBox.alert('登录请求失败，请稍后再试', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
}
</script>

<template>
  <div class="login-container">
    <AspectRatioBox class="login-form blur-bg" :aspect-ratio="20/19" :widthPercentage="36">
      <h1>登录</h1>
      <form class="form">
        <div class="form-group">
          <label for="userid">账号：</label>
          <el-input class="input" type="text" id="userid" v-model="userid" placeholder="请输入账号..." required clearable/>
        </div>
        <div class="form-group">
          <label for="password">密码：</label>
          <el-input class="input" type="password" id="password" v-model="password" placeholder="请输入密码..." show-password required clearable/>
        </div>
      </form>
      <div class="actions">
        <button @click="login" type="button" class="login-btn">登录</button>
        <router-link to="/register" class="register-link">注册新用户</router-link>
      </div>
    </AspectRatioBox>

  </div>
</template>

<style scoped>
/* 重置全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 确保html和body完全占满屏幕 */
:global(html), :global(body) {
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 主容器样式 - 确保背景图片完全显示 */
/*将 background-size: cover 改为 background-size: 100% 100%
这确保背景图片会拉伸以完全填满容器，不会有任何部分被裁剪
使用绝对定位确保容器完全占满屏幕
同时设置了top、left、right、bottom为0*/
.login-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-image: url('../assets/img/loginback1.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center center;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 10%;
  overflow: hidden;
}

/* 备用背景样式 - 确保在任何情况下都能铺满 */
.login-container::before {
  /*创建了一个伪元素作为备用背景，确保即使主背景有问题，也能正常显示*/
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('../assets/img/loginback1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}

.login-form {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.35);
  z-index: 10;
  box-sizing: border-box;
  position: relative;

  transform-origin: left center;
  transition: transform 0.1s ease-out;

}

.login-form h1 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 19px;
  width: 100%;
  height: 14%;
}

.form {
  width: 100%;
  height: 54%;
}
.form-group {
  margin-bottom: 14px;
  width: 100%;
  height: 45%;
}

.actions {
  width: 100%;
  height: 20%;
}

label {
  font-size: 12px;
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  width:100%;
  height:30%;
}

.input {
  font-size: 16px;
  width: 100%;
  height: 45%;
}

input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.login-btn {
  width: 100%;
  height: 60%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  /*设置小手*/
  cursor: pointer;
  font-size: 18px;
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
  width: 100%;
  height: 50%;
  margin-top: 4px;
  display: block;
  text-align: center;
}

/* 简化响应式设计 - 只调整内容样式，不覆盖尺寸 */
@media (min-width: 1200px) {
  .login-form {
    padding: 14px 40px;
  }

  .login-form h1 {
    font-size: 28px;
  }

  label {
    font-size: 20px;
  }

  input, .login-btn {
    padding: 10px;
    font-size: 18px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .login-form {
    padding: 10px;
  }

  .login-form h1 {
    font-size: 28px;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .login-form {
    padding: 10px;
  }

  .login-form h1 {
    font-size: 26px;
    margin-bottom: 25px;
  }

  label {
    font-size: 16px;
  }

  input, .login-btn {
    padding: 12px;
    font-size: 16px;
  }
}

/* 小屏设备 - 移除所有尺寸覆盖 */
@media (max-width: 575px) {
  .login-form {
    padding: 10px;
  }

  .login-form h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  label {
    font-size: 16px;
    margin-bottom: 6px;
  }

  input, .login-btn {
    padding: 12px;
    font-size: 16px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .login-btn {
    margin-top: 12px;
    margin-bottom: 15px;
  }
}

@media (max-width: 400px) {
  .login-form {
    padding: 10px;
  }

  .login-form h1 {
    font-size: 22px;
  }

  input, .login-btn {
    padding: 10px;
    font-size: 14px;
  }

  label {
    font-size: 14px;
  }
}

/* 高度较小的屏幕适配 */
@media (max-height: 600px) {
  .login-container {
    background-size: 100% 100%;
  }

  .login-form {
    padding: 10px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .login-form h1 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  input, .login-btn {
    padding: 10px;
  }
}

/* 横屏模式下的特殊处理 */
@media (orientation: landscape) and (max-height: 500px) {
  .login-container {
    background-size: 100% 100%;
  }

  .login-form {
    padding: 10px;
    max-width: 350px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .login-form h1 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  input, .login-btn {
    padding: 8px;
    font-size: 14px;
  }
}

/* 强制背景铺满 - 适用于所有屏幕比例 */
@media screen {
  .login-container {
    background-size: 100% 100% !important;
  }
}

/* 确保在极端宽屏下也能正常显示 */
@media (min-aspect-ratio: 21/9) {
  .login-container {
    background-size: 100% 100% !important;
    background-position: center center !important;
  }
}

/* 确保在极端竖屏下也能正常显示 */
@media (max-aspect-ratio: 9/16) {
  .login-container {
    background-size: 100% 100% !important;
    background-position: center center !important;
  }
}

</style>