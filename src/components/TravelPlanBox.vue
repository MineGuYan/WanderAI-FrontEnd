<script setup lang="ts">
import { ref } from 'vue'
import {
  Clock,
  Location,
  Promotion,
  Van,
  InfoFilled,
  Calendar,
  Lightning,
  House,
  Food
} from '@element-plus/icons-vue'
import type {AttractionMap, ExecutorResult} from "../model/model.ts";

const props = defineProps({
  travelPlan: {
    type: Object,
    required: true
  }
})

const activeDetails = ref([])

// 根据天数获取执行结果
const getExecutorResult = (day: number) => {
  return props.travelPlan.executor_results.find((item: ExecutorResult) => item.day === day)
}

// 获取景点地图URL
const getMapUrl = (attractionName: string) => {
  const mapItem = props.travelPlan.attraction_maps.find((item: AttractionMap) => item.attraction === attractionName)
  return mapItem ? mapItem.static_map_url : null
}

// 滚动到指定的section
async function scrollToContent(index: number) {
  if (!(index in activeDetails.value)) {
    activeDetails.value = [index as never]
    setTimeout(() => {
      const element = document.getElementById(`content-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },350)
  } else {
    const element = document.getElementById(`content-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
</script>

<template>
  <div class="travel-plan-container">
    <!-- 旅行计划概览 -->
    <el-card class="summary-card">
      <template #header>
        <div class="card-header">
          <h2>{{ travelPlan.summary_result.title }}</h2>
        </div>
      </template>
      <div class="overview">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="overview-item">
              <el-icon><Clock /></el-icon>
              <span>行程时长: {{ travelPlan.summary_result.overview.duration }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="overview-item">
              <el-icon><Location /></el-icon>
              <span>景点数量: {{ travelPlan.summary_result.overview.attraction_count }}个</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="overview-item">
              <el-icon><Promotion /></el-icon>
              <span>总距离: {{ travelPlan.summary_result.overview.total_distance }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 每日行程 -->
    <div class="daily-schedules">
      <el-tabs type="border-card">
        <el-tab-pane v-for="day in travelPlan.daily_schedules" :key="day.day" :label="`第${day.day}天`">
          <div class="day-content">
            <!-- 景点列表 -->
            <el-card class="attractions-card">
              <template #header>
                <div class="card-header">
                  <h3>当日景点</h3>
                </div>
              </template>
              <el-tag
                v-for="(attraction, index) in day.attractions"
                :key="index"
                type="info"
                class="attraction-tag"
                @click="scrollToContent(index)"
              >
                {{ attraction }}
              </el-tag>
            </el-card>

            <!-- 路线信息 -->
            <el-card class="routes-card" v-if="getExecutorResult(day.day)?.routes">
              <template #header>
                <div class="card-header">
                  <h3>路线规划</h3>
                </div>
              </template>
              <div class="route-item" >
                <el-steps direction="vertical" :active="getExecutorResult(day.day)?.routes.length">
                  <el-step v-for="(route, index) in getExecutorResult(day.day)?.routes" :key="index">
                    <template #title>
                      <div class="route-title">
                        <span class="route-index">第{{ index + 1 }}段</span>
                        <span class="route-transport">
                          <el-icon><Van /></el-icon>
                          {{ route.transport }}
                        </span>
                      </div>
                    </template>
                    <template #description>
                      <div class="route-desc">
                        <p><span class="label">起点:</span> {{ route.origin }}</p>
                        <p><span class="label">终点:</span> {{ route.destination }}</p>
                        <p><span class="label">距离:</span> {{ route.distance }}</p>
                        <p><span class="label">耗时:</span> {{ route.duration }}</p>
                      </div>
                    </template>
                  </el-step>
                </el-steps>
              </div>
            </el-card>

            <!-- 景点详情 -->
            <el-card class="details-card" v-if="getExecutorResult(day.day)?.attraction_details">
              <template #header>
                <div class="card-header">
                  <h3>景点详情</h3>
                </div>
              </template>
              <el-collapse v-model="activeDetails">
                <el-collapse-item
                  v-for="(detail, index) in getExecutorResult(day.day)?.attraction_details"
                  :key="index"
                  :title="detail.attraction"
                  :name="index"
                >
                  <div class="detail-content" :id="'content-'+index">
                    <p><span class="label">地址:</span> {{ detail.address }}</p>
                    <p><span class="label">坐标:</span> {{ detail.coordinates }}</p>
                    <p><span class="label">介绍:</span> {{ detail.introduction }}</p>
                    <div class="map-container" v-if="getMapUrl(detail.attraction)">
                      <img :src="getMapUrl(detail.attraction)" alt="景点地图" class="map-image">
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-card>

            <!-- 备注卡片 -->
            <el-card class="remarks-card" v-if="getExecutorResult(day.day)?.remark_cards">
              <template #header>
                <div class="card-header">
                  <h3>旅行建议</h3>
                </div>
              </template>
              <div class="remark-item">
                <h4><el-icon><InfoFilled /></el-icon> 行程特色</h4>
                <p>{{ getExecutorResult(day.day)?.remark_cards.trip_feature }}</p>
              </div>
              <div class="remark-item">
                <h4><el-icon><Calendar /></el-icon> 行程安排</h4>
                <p>{{ getExecutorResult(day.day)?.remark_cards.arrangement_description }}</p>
              </div>
              <div class="remark-item">
                <h4><el-icon><Lightning /></el-icon> 旅行建议</h4>
                <p>{{ getExecutorResult(day.day)?.remark_cards.travel_suggestion }}</p>
              </div>
              <div class="remark-item">
                <h4><el-icon><House /></el-icon> 住宿推荐</h4>
                <p>{{ getExecutorResult(day.day)?.remark_cards.accommodation }}</p>
              </div>
              <div class="remark-item">
                <h4><el-icon><Food /></el-icon> 美食推荐</h4>
                <p>{{ getExecutorResult(day.day)?.remark_cards.food_recommendation }}</p>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.travel-plan-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview {
  padding: 10px 0;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.daily-schedules {
  margin-top: 20px;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.attractions-card {
  margin-bottom: 20px;
}

.attraction-tag {
  font-size: 14px;
  color: #404143;
  margin-right: 10px;
  margin-bottom: 10px;
  background-color: #8de3cd;
}

.route-item {
  margin-bottom: 20px;
}

.route-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-index {
  font-weight: bold;
}

.route-transport {
  display: flex;
  align-items: center;
  gap: 5px;
}

.route-desc {
  padding-left: 20px;
}

.details-card :deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: bold;
  color: #1fec7e;
}
/*当给 el-collapse-item 添加 class="place" 时，这个类确实被添加到了组件上，但实际显示标题的元素是组件内部的 .el-collapse-item__header 元素
所以不应该用这种方法，可用:deep() 选择器，其允许样式穿透组件的封装，直接影响到组件内部的元素。
 */

.label {
  font-weight: bold;
  margin-right: 5px;
  color: #606266;
}

.detail-content {
  padding: 10px;
}

.map-container {
  margin-top: 15px;
  text-align: center;
}

.map-image {
  max-width: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.remark-item {
  margin-bottom: 15px;
}

.remark-item h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #409EFF;
}
</style>