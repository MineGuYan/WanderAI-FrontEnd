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
  Food,
  Position
} from '@element-plus/icons-vue'
import type {AttractionMap, ExecutorResult, AttractionDetail} from "../model/model.ts";

const props = defineProps({
  travelPlan: {
    type: Object,
    required: true
  }
})

const activeDetails = ref<number[]>([])

// 根据天数获取执行结果
const getExecutorResult = (day: number) => {
  return props.travelPlan.executor_results.find((item: ExecutorResult) => item.day === day)
}

// 获取景点地图URL
const getMapUrl = (attractionName: string) => {
  const mapItem = props.travelPlan.attraction_maps.find((item: AttractionMap) => item.attraction === attractionName)
  return mapItem ? mapItem.static_map_url : null
}

// 点击景点标签滚动到对应详情
const scrollToAttraction = (attractionName: string, dayNumber: number) => {
  // 首先展开对应的折叠项
  const executorResult = getExecutorResult(dayNumber)
  /*通过 getExecutorResult(dayNumber) 获取某个特定天数（dayNumber）的执行结果。executorResult 是一个对象，包含了景点的详细信息*/
  if (executorResult?.attraction_details) {
    const targetIndex: number = executorResult.attraction_details.findIndex(
      (detail: AttractionDetail) => detail.attraction === attractionName
    )
    /*如果 executorResult 存在并且包含 attraction_details（景点详情），代码会在 attraction_details 数组中查找与 attractionName 匹配的景点名称。
      findIndex() 方法返回匹配景点的索引。如果没有找到匹配的景点，targetIndex 将会是 -1
     */

    if (targetIndex !== -1) {
      // 确保该项在activeDetails中
      if (!activeDetails.value.includes(targetIndex)) {
        activeDetails.value.push(targetIndex)
      }
      /*如果找到了匹配的景点，代码会检查 activeDetails 数组（假设它用于管理折叠项的显示状态）是否已经包含该项的索引（targetIndex）。
      如果没有，它会将该索引添加到 activeDetails.value 中，确保对应的折叠项会展开
       */

      // 等待DOM更新后滚动
      setTimeout(() => {
        // 使用更精确的选择器
        const collapseItems = document.querySelectorAll('.el-collapse-item')
        const targetItem = Array.from(collapseItems).find(item => {
          const titleElement = item.querySelector('.el-collapse-item__header')
          return titleElement && titleElement.textContent?.trim() === attractionName
        })

        if (targetItem) {
          targetItem.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          })
        }
      }, 300)
      /*使用 setTimeout 延迟 300 毫秒，等待 DOM 更新完成（因为我刚才通过修改 activeDetails 展开了折叠项，DOM 需要一些时间来更新）。
        document.querySelectorAll('.el-collapse-item') 获取所有折叠项（.el-collapse-item 是折叠项的类名）。
        然后，代码通过 Array.from(collapseItems) 将 NodeList 转换为数组，使用 find() 方法查找具有匹配标题的折叠项（标题与 attractionName 匹配）。
        item.querySelector('.el-collapse-item__header') 获取折叠项的标题元素，如果标题元素的文本内容与 attractionName 相符，则该折叠项就是目标项。
        如果找到了目标项，就使用 scrollIntoView 方法将其平滑滚动到视口中，behavior: 'smooth' 表示滚动时使用平滑过渡效果，block: 'start' 表示滚动到元素的顶部，inline: 'nearest' 表示根据元素的位置选择最合适的滚动方式。
       */
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
                @click="scrollToAttraction(attraction, day.day)"
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
                  <div class="detail-content">
                    <p><span class="label">地址:</span> {{ detail.address }}</p>
<!--                    <p><span class="label">坐标:</span> {{ detail.coordinates }}</p>-->
                    <p><span class="label">前往地图导航:</span> <a :href="`https://uri.amap.com/marker?position=${detail.coordinates}`" title="跳转到高德地图" target="_blank"><el-icon><Position /></el-icon></a></p>
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
  cursor: pointer;
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
所以不应该用这种方法，可用:deep() 选择器，其允许样式穿透组件的封装，直接影响���组件内部的元素。
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

:deep(.el-step__head) {
  z-index: 0;
}
</style>