<script setup lang="ts">
import "../assets/iconfont/iconfont.css"
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../api/request.ts'
import type { HotSpot } from '../model/model.ts'
import SafeImg from "../components/SafeImg.vue"
import { Refresh } from '@element-plus/icons-vue'

const colors = [
  '#7dd3c0', '#75d4c2', '#6dd5c4', '#65d6c6', '#5dd7c8', '#55d8ca',
  '#4dd9cc', '#45dace', '#3ddbd0', '#35dcd2', '#2dddd4', '#25ded6',
  '#1ddfd8', '#15e0da', '#0de1dc', '#05e2de', '#00e3e0', '#00dde3',
  '#00d7e6', '#00d1e9', '#00cbec', '#00c5ef', '#00bff2', '#00b9f5',
  '#00b3f8', '#00adfb'
]
const currentColorIndex = ref(0)
const HotSpots = ref<HotSpot[]>([])
const refreshing = ref(false)
const scrollableDiv = ref<HTMLDivElement | null>(null);

function getCharColor(index: number) {
  // 根据索引和当前颜色索引返回颜色，从左往右变换
  const colorIndex = (index - currentColorIndex.value + colors.length) % colors.length
  return colors[colorIndex]
}

async function getHotSpots() {
  try {
    const response = await api.get("/hotspot",{
      params: {
        refresh: false
      }
    })
    HotSpots.value = response.data.data as HotSpot[]
  } catch (error) {
    console.error("获取热门景点失败:", error)
  }
}

async function refreshHotSpots() {
  if (scrollableDiv.value) {
    scrollableDiv.value.scrollTop = 0;
  }
  refreshing.value = true
  try {
    const response = await api.get("/hotspot",{
      params: {
        refresh: true
      }
    })
    HotSpots.value = response.data.data as HotSpot[]
  } catch (error) {
    console.error("刷新热门景点失败:", error)
  } finally {
    refreshing.value = false
  }
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
<!--      实现了“彩虹文字”动态变色效果-->
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

    <div class="recommendation">
      <div class="recommendation-header">
        <h3 class="recommendation-title">热门景点推荐</h3>
        <div @click="refreshHotSpots" class="recommendation_refresh">
          <el-icon class="refresh"><Refresh /></el-icon>
          <span>点击换一批</span>
        </div>
      </div>
      <div class="recommendation-list" v-loading="refreshing" :style="{ overflow: refreshing ? 'hidden' : 'auto' }" ref="scrollableDiv">
        <div ></div>
        <div class="recommendation_hotspot" v-for="hs in HotSpots" :key="hs.name">
          <strong>{{ hs.name }}:</strong> {{ hs.description }}
          <SafeImg :url="hs.image"></SafeImg>
        </div>
      </div>
    </div>

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
      <router-link to="/about" class="about-button">了解更多</router-link>
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
  max-width: 1200px;
  margin: 10px auto;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.recommendation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  position: relative;
}

.recommendation-title {
  color: #4beccc;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.recommendation_refresh {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #4beccc;
  font-size: 16px;
  transition: all 0.3s ease;
  margin-left: auto;
}

.recommendation_refresh:hover {
  color: #2a9d8f;
  transform: scale(1.05);
}

.recommendation_refresh .refresh {
  font-size: 18px;
}

.recommendation-list {
  width: 100%;
  max-height: 440px;
  min-height: 300px;
  overflow-y: auto;
  padding: 10px 0;
}

.recommendation_hotspot {
  color: #333;
  font-size: 18px;
  text-align: left;
  padding: 15px 20px;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border-left: 4px solid #4beccc;
  line-height: 1.5;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.recommendation_img:hover {
  background-color: rgba(255, 255, 255, 0.95);
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(75, 236, 204, 0.3);
}

.recommendation_img:last-child {
  margin-bottom: 0;
}

/* 自定义滚动条样式 */
.recommendation-list::-webkit-scrollbar {
  width: 6px;
}

.recommendation-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.recommendation-list::-webkit-scrollbar-thumb {
  background: rgba(75, 236, 204, 0.6);
  border-radius: 3px;
}

.recommendation-list::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 236, 204, 0.8);
}

.chat-box {
  position: fixed;
  bottom: 14vh;
  left: 50%;
  transform: translateX(-50%);
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
  margin-top: 12px;
}

.iconfont.icon-atm-fill {
  margin-top: 5px;
  color: #818ea0;
  font-size: 26px;
  margin-right: 5px;
}

.teammate {
  color: #73808e;
  font-size: 20px;
  position: fixed;
  bottom: 8vh;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 1000;
}

/* 动态字符颜色类 */
.char {
  display: inline-block;
  transition: color 0.01s ease;
  font-weight: 600;
}

/* 新增关于按钮样式 */
.about-button {
  margin-left: 10px;
  padding: 8px 16px;
  background-color: #48c6f3;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.3s;
}

.about-button:hover {
  color: #e6c022;
  background-color: #0b60c0;
}
</style>
