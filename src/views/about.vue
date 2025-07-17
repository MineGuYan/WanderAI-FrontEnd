<script setup lang="ts">
import "../assets/iconfont/iconfont.css"
</script>

<template>
  <div class="header_line">
    <router-link to="/" class="reback-button">回到主页</router-link>
    <span class="teammate">
      <span class="iconfont icon-atm-fill"></span>
      <span class="team">研发团队：捉虫大队</span>
    </span>
  </div>
  <div class="image-container">
    <img src="../assets/img/aboutus.jpg" alt="关于我们" class="about-image">
    <div class="overlay-text">关于我们</div>
  </div>

  <div class="description">
    <p><strong>简介：</strong>"漫游精灵"是一款基于大模型API的智能旅行助手，致力于通过高效、智能的对话方式，帮助用户规划旅行并优化出行体验。它不仅具备多轮流式对话功能，还能根据用户的需求提供个性化的旅行服务。以下是该应用程序的主要功能和拓展功能：</p>
  </div>
  <div class="features-section">
    <div class="main-features">
      <h2>主要功能：</h2>
      <div class="feature-item">
        <h3>1.多轮流式对话的普通聊天</h3>
        <p>用户可以与"漫游精灵"进行自然流畅的对话，不仅仅是问答，还可以通过多轮对话来深入交流和获取旅行建议。</p>
      </div>
      <div class="feature-item">
        <h3>2.旅行路线规划</h3>
        <p>根据用户的需求，自动生成个性化的旅行路线和景点游玩顺序，帮助用户高效安排旅行时间和景点</p>
      </div>
      <div class="feature-item">
        <h3>3.聊天历史记录</h3>
        <p>该功能允许用户查看和访问过去的聊天记录，甚至可以根据历史记录继续进行对话，使用户的旅行规划更加连贯和便捷</p>
      </div>
      <div class="feature-item">
        <h3>4.登录注册模块</h3>
        <p>提供安全的用户登录与注册功能，支持密码加密，确保用户信息的安全性</p>
      </div>
      <div class="feature-item">
        <h3>5.历史记录标题生成</h3>
        <p>自动分析用户第一次对话的内容，智能生成标题，帮助用户快速识别和整理旅行相关的信息</p>
      </div>
      <div class="feature-item">
        <h3>6.出行方式及时间规划</h3>
        <p>根据景点之间的距离和交通情况，自动规划两地之间的出行方式和预计时间，使用户的出行更加高效、顺畅。</p>
      </div>
    </div>

    <div class="extended-features">
      <h2>拓展功能：</h2>
      <div class="feature-item">
        <h3>1.热门景点推荐</h3>
        <p>智能推荐近期的热门景点，给用户的旅行提供参考</p>
      </div>
      <div class="feature-item">
        <h3>2.旅行过程天气查询</h3>
        <p>为用户提供实时的天气预报，帮助其在选择旅行路线时考虑天气因素，提升旅行体验</p>
      </div>
      <div class="feature-item">
        <h3>3.食宿推荐</h3>
        <p>根据用户选择的旅行路线推荐适合的餐饮和住宿选择，提升旅行的舒适度</p>
      </div>
      <div class="feature-item">
        <h3>4.目的地导航</h3>
        <p>在用户确定旅行目的地后，提供精确的导航服务，帮助其更方便地到达各景点</p>
      </div>
      <div class="feature-item">
        <h3>5.用户改进意见收集</h3>
        <p>收集用户的反馈意见，以便后续改进系统的功能和用户体验</p>
      </div>
      <div class="feature-item">
        <h3>6.静态地图生成</h3>
        <p>为用户提供旅行路线的静态地图，便于用户提前规划行程</p>
      </div>
    </div>
  </div>
  <div class="description">
    <p>总的来说，“漫游精灵”不仅为用户提供旅行规划的多维度服务，而且通过智能对话系统，使旅行计划更加便捷、个性化。该产品在提升用户旅行体验方面具有很大的应用前景，能够帮助用户解决从旅行前的计划到旅行中的每个细节问题。</p>
  </div>

</template>

<style scoped>
.header_line {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.reback-button {
  width: 8%;
  height: 40px;
  display: flex;
  /*垂直居中*/
  align-items: center;
  /*水平居中*/
  justify-content: center;
  color: #000000;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 20px;
  text-decoration-line: none;
  /*气泡设置*/
  border-radius:12px;
  background-color: #5ba4ea;
}
.reback-button:hover{
  background-color: #4a8cd6;
  color: #ffffff;
}
.iconfont{
  color: #0694ec;
  font-size: 26px;
  margin-right: 5px;
}

.teammate {
  color: #1881ec;
  font-size: 28px;
  font-weight:600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 0 0;
  text-align: center;
  z-index: 1000;
}

.image-container {
  margin-top: 20px;
  position: relative;
  text-align: center;
  color: white;
}

.about-image {
  width: 100%;
  height: auto;
}

.overlay-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.description {
  margin: 30px auto;
  padding: 20px;
  max-width: 1000px;
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  text-align: justify;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.description p {
  margin: 0;
  text-indent: 2em;
}

.features-section {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.main-features, .extended-features {
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #0694ec;
}

.main-features h2 {
  color: #0694ec;
  font-size: 24px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.extended-features h2 {
  color: #1881ec;
  font-size: 24px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.feature-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #0694ec;
}

.feature-item h3 {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 600;
}

.feature-item p {
  margin: 0;
  color: #555;
  line-height: 1.6;
  text-align: justify;
}

</style>