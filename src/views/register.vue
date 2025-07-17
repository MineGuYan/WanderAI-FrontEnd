<script setup lang="ts">
import { ref, watch } from "vue";
import api from '../api/request.ts';
import { useRouter } from "vue-router";
import { sha256 } from 'js-sha256'
import { ElMessageBox } from "element-plus";
// @ts-ignore
import AspectRatioBox from "../components/AspectRatioBox.vue";

const username = ref('')
const password1 = ref('')
const password2 = ref('')

watch(username, (newValue) => {
  if (newValue.length > 20) {
    username.value = newValue.slice(0, 20);
    ElMessageBox.alert('昵称不能超过20个字符', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
});

watch(password1, (newValue) => {
  if( newValue.length > 6) {

  } else {

  }

  if (newValue.length > 15) {
    password1.value = newValue.slice(0, 15);
    ElMessageBox.alert('密码不能超过15个字符', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
});

watch(password2, (newValue) => {
  if( newValue.length > 6) {

  } else {

  }

  if (newValue.length > 15) {
    password2.value = newValue.slice(0, 15);
    ElMessageBox.alert('密码不能超过15个字符', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
});

async function register() {
  if (username.value === '' || password1.value === '') {
    await ElMessageBox.alert('昵称和密码不能为空', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
    return;
  }

  if (password1.value !== password2.value) {
    await ElMessageBox.alert('两次输入的密码不一致，请重新输入', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
    return;
  }

  const encryptedPassword = sha256(password1.value)

  try {
    const response = await api.post('/user/register', {
      nickname: username.value,
      password: encryptedPassword,
    });

    if (response.data.code === 1) {
      await ElMessageBox.alert('注册成功！\n您的账号为：' + response.data.data.accountId, '提示', {
        confirmButtonText: '确定',
        type: 'success'
      });
      await useRouter().push('/login');
    } else {
      await ElMessageBox.alert('注册失败，请稍后再试', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      });
    }
  } catch (error) {
    await ElMessageBox.alert('注册请求失败，请稍后再试', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
}
</script>

<template>
  <div class="register-container">
    <AspectRatioBox class="register-form blur-bg" :aspect-ratio="100/115" :widthPercentage="36">
      <h1>注册</h1>
      <form class="form">
        <div class="form-group">
          <label for="username">昵称：</label>
          <el-input class="input" type="text" id="username" v-model="username" placeholder="请输入用户昵称..." required />
        </div>
        <div class="form-group">
          <label for="password1">密码：</label>
          <el-input class="input" type="password" id="password1" v-model="password1" placeholder="请输入密码..." show-password required />
        </div>
        <div class="form-group">
          <label for="password2">确认密码：</label>
          <el-input class="input" type="password" id="password2" v-model="password2" placeholder="请再次输入密码..." show-password required />
        </div>
      </form>
      <div class="actions">
        <button @click="register" type="button" class="register-btn">注册</button>
        <router-link to="/login" class="login-link">已有帐号，返回登录</router-link>
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
.register-container {
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
.register-container::before {
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

.register-form {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.35);
  z-index: 10;
  box-sizing: border-box;
  position: relative;

  transform-origin: left center;
  transition: transform 0.1s ease-out;
}

.register-form h1 {
  text-align: center;
  margin-top: 0;
  color: #333;
  font-size: 19.2px;
  width: 100%;
  height: 12%;

  /* 覆盖用户代理样式表的默认margin */
  margin-block-start: 2px;  /* 原来是0.67em，现在设为0.2em */
  margin-block-end: 2px;    /* 原来是0.67em，现在设为0.2em */
  /*覆盖用户代理样式表的默认padding */
  padding-block-start: 0px; /* 原来是0.67em，现在设为0 */
  padding-block-end: 0px;   /* 原来是0.67em，现在设为0 */
}
.form {
  width: 100% ;
  height: 60%;
}

.form-group {
  margin-bottom: 14px;
  width: 100%;
  height: 30%;
}

label {
  font-size: 12px;
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  width: 100%;
  height: 34%;
}

.input {
  font-size: 16px;
  width: 100%;
  height: 54%;
}

input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
.actions {
  width: 100%;
  height: 28%;
}

.register-btn {
  width: 100%;
  height: 40%;
  padding: 14px;
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
.register-btn:hover {
  background-color: #0678d5;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  transform: translateY(-3px);
}

/* 按钮按下时的效果 */
.register-btn:active {
  background-color: #015cb9;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.3);
  transform: translateY(0);
  transition: all 0.1s ease;
}

/*添加蓝色聚焦环*/
.register-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
}

.login-link{
  width: 100%;
  height: 50%;
  display: block;
  text-align: center;
}

/* 简化响应式设计 - 只调整内容样式，不覆盖尺寸 */
@media (min-width: 1200px) {
  .register-form {
    padding: 12px 40px;
  }

  .register-form h1 {
    font-size: 28px;
  }

  label {
    font-size: 20px;
  }

  input, .register-btn {
    padding: 10px;
    font-size: 18px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .register-form {
    padding: 10px;
  }

  .register-form h1 {
    font-size: 28px;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .register-form {
    padding: 10px;
  }

  .register-form h1 {
    font-size: 26px;
    margin-bottom: 25px;
  }

  label {
    font-size: 16px;
  }

  input, .register-btn {
    padding: 12px;
    font-size: 16px;
  }
}

/* 小屏设备 - 移除所有尺寸覆盖 */
@media (max-width: 575px) {
  .register-form {
    padding: 12px;
  }

  .register-form h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  label {
    font-size: 16px;
    margin-bottom: 6px;
  }

  input, .register-btn {
    padding: 12px;
    font-size: 16px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .register-btn {
    margin-top: 12px;
    margin-bottom: 15px;
  }
}

@media (max-width: 400px) {
  .register-form {
    padding: 12px;
  }

  .register-form h1 {
    font-size: 22px;
  }

  input, .register-btn {
    padding: 10px;
    font-size: 14px;
  }

  label {
    font-size: 14px;
  }
}

/* 高度较小的屏幕适配 */
@media (max-height: 600px) {
  .register-container {
    background-size: 100% 100%;
  }

  .register-form {
    padding: 12px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .register-form h1 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  input, .register-btn {
    padding: 10px;
  }
}

/* 横屏模式下的特殊处理 */
@media (orientation: landscape) and (max-height: 500px) {
  .register-container {
    background-size: 100% 100%;
  }

  .register-form {
    padding: 12px;
    max-width: 350px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .register-form h1 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  input, .register-btn {
    padding: 8px;
    font-size: 14px;
  }
}

</style>