<script setup lang="ts">
import "../assets/iconfont/iconfont.css"
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../api/request.ts'
import type { HotSpot } from '../model/model.ts'

const colors = [
  '#7dd3c0', '#75d4c2', '#6dd5c4', '#65d6c6', '#5dd7c8', '#55d8ca',
  '#4dd9cc', '#45dace', '#3ddbd0', '#35dcd2', '#2dddd4', '#25ded6',
  '#1ddfd8', '#15e0da', '#0de1dc', '#05e2de', '#00e3e0', '#00dde3',
  '#00d7e6', '#00d1e9', '#00cbec', '#00c5ef', '#00bff2', '#00b9f5',
  '#00b3f8', '#00adfb'
]
const currentColorIndex = ref(0)
const HotSpots = ref<HotSpot[]>([])

function getCharColor(index: number) {
  // 根据索引和当前颜色索引返回颜色，从左往右变换
  const colorIndex = (index - currentColorIndex.value + colors.length) % colors.length
  return colors[colorIndex]
}

async function getHotSpots() {
  const response = await api.get("/hotspot")
  HotSpots.value = response.data.data as HotSpot[]
}

onMounted(() => {
  getHotSpots()

  const timer = setInterval(() => {
    currentColorIndex.value = (currentColorIndex.value + 1) % colors.length
  }, 200)
  // 组件卸载时清除定时器
  onUnmounted(() => clearInterval(timer))
})
</script>

<template>
  <div class="home-container">
    <!-- 新增的更新公告文字 -->
    <p class="update-notice">
      <span
        v-for="(char, index) in '漫游精灵，成为你旅途中的知心伙伴，带你探索每一个精彩瞬间'"
        :key="index"
        :style="{ color: getCharColor(index) }"
        class="char"
      >
        {{ char }}
      </span>
    </p>

    <div class="header-container">
      <span class="iconfont icon-ai"></span>
      <h1 class="title">漫游精灵——WanderAI</h1>
    </div>

    <p class="sub_title">作为你的智能伙伴，我既能生成旅行规划，还能陪你聊天、快跟我交流吧!</p>

    <ul class="recommendation">
      热门景点推荐
      <li class="recommendation_img" v-for="hs in HotSpots">
        <strong>{{ hs.name }}:</strong>>{{ hs.description }}
      </li>
    </ul>

    <!-- 蓝色框包含开始对话按钮 -->
    <div class="chat-box">
      <router-link to="/chat" class="button">
        开始对话
        <p class="description">与各种大模型免费对话，体验全新聊天模型</p>
      </router-link>
    </div>

    <!-- 将teammate移动到chat-box下面 -->
    <div class="teammate">
      <span class="iconfont icon-atm-fill"></span>
      <span class="team">研发团队：捉虫大队</span>
    </div>
  </div>
</template>

<style scoped>

:global(html, body, #app) {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.home-container {
  min-height: 100vh;
  width: 100vw;
  background-image: url('../assets/img/home-background2.webp');
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

/* 添加了一个半透明的白色覆盖层，位于背景图像上方，用于给背景图加上一个轻微的白色遮罩效果。*/
.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.15);
  z-index: 1;
}

.home-container > * {
  position: relative;
  z-index: 2;
}

/* 新增的更新公告文字样式 */
.update-notice {
  font-size: 32px;
  text-align: center;
  margin: 25px 0 20px 0;
  font-weight: 500;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.iconfont.icon-ai {
  margin-top:5px;
  font-size: 40px;
  color: #2e95df;
}

.title {
  color: #0a92ef;
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.sub_title {
  color: #0e0b0b;
  font-size: 16px;
  text-align: center;
  margin-top: 25px;
}


.recommendation{
  padding: 0;
  width: 100%;
  display: flex;
  color: #4beccc;
  font-size: 24px;
  text-align: center;
  margin-top: 15px;
  justify-content: center;
  font-weight: bold;
}

/* 蓝色框样式 */
.chat-box {
  margin: 300px 0 0 0;
  padding: 10px;
  text-align: center;
}

.button {
  /*改为相对位置*/
  position: relative;
  max-width: 400px;
  display: inline-block;
  padding: 10px 20px;
  color: #078eef;
  text-decoration: none;
  border-radius: 15px;
  font-size: 26px;
  font-weight: bold;
  transition: all 0.3s;

  background-color: rgba(255, 255, 255, 0.1);
  /*改为更透明的白色，让背景图片能够更多地透过chat-box显示*/
  backdrop-filter: blur(8px);
  /* 减少模糊效果，让背景更清晰 */
  box-shadow: 0 8px 32px rgba(81, 197, 239, 0.15);
  /* 减淡阴影效果 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  /*增强边框，提高可见性*/
}

.button:hover {
  background-color: #d7d7d1;
  transform: translateY(-2px);
}

.description {
  color: #666;
  font-size: 18px;
  line-height: 1.5;
  margintop: 12px;
}

.iconfont.icon-atm-fill {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 26px;
  margin-right: 5px;
}

.teammate {
  color: #94a3b8;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 0 0;
  text-align: center;
  z-index: 1000;
}

/* 动态字符颜色类 */
.char {
  display: inline-block;
  transition: color 0.01s ease;
  font-weight: 600;
}
</style>
