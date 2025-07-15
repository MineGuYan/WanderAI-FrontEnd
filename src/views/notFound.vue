<script setup lang="ts">

</script>

<template>
  <div class="notFound-container">
      <router-link to="/" class="button">返回主页</router-link>
  </div>
</template>

<style scoped>
.button {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  /* 联块级元素（可设置宽高，同时保持行内特性） */
  display: inline-block;
  padding: 15px 30px;
  color: #078eef;
  text-decoration: none;
  border-radius: 8px;
  font-size: 28px;
  font-weight: bold;
  transition: all 0.3s;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: fixed;
  top: 57%;
  left: 47.3%;
  z-index: 100;
}

.button:hover {
  background-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-5px);
}

.notFound-container {
  min-height: 100vh;
  width:100vw;
  background-image: url('../assets/img/background1.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

</style>