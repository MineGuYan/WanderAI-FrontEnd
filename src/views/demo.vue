<script setup lang="ts">
import TravelPlanBox from "../components/TravelPlanBox.vue";

const travelPlanData= 'data: {"type":"all","content":{"summary_result":{"title":"泰安一日游计划","overview":{"duration":"1天","attraction_count":3,"total_distance":"5.3km"}},"daily_schedules":[{"day":1,"attractions":["泰山","岱庙","天外村"]}],"executor_results":[{"day":1,"routes":[{"origin":"岱庙","destination":"泰山","transport":"公交","distance":"3.5km","duration":"20min"},{"origin":"泰山","destination":"天外村","transport":"步行","distance":"1.8km","duration":"25min"}],"attraction_details":[{"attraction":"岱庙","address":"山东省泰安市泰山区东岳大街19号","coordinates":"117.12647,36.18857","introduction":"岱庙，位于山东省泰安市城区北部，是古代帝王来泰山封禅时居住和举行大典的地方。它始建于秦汉时期，现存建筑多为明清两代所建，是中国四大古建筑群之一。"},{"attraction":"泰山","address":"山东省泰安市泰山区红门路","coordinates":"117.13167,36.25833","introduction":"泰山，五岳之首，位于山东省中部，主峰玉皇顶海拔1545米。自古以来就是中华民族的象征，也是中国传统文化的重要组成部分。每年吸引着无数游客前来登山祈福。"},{"attraction":"天外村","address":"山东省泰安市泰山区环山路","coordinates":"117.13583,36.25833","introduction":"天外村是泰山风景区的一个重要入口，这里不仅有便捷的交通设施，还有美丽的自然风光。从这里可以乘坐索道直达中天门，是游览泰山的一条主要路线。"}],"remark_cards":{"trip_feature":"探索泰山的历史文化与自然美景","arrangement_description":"上午参观岱庙，了解泰山的文化背景；下午攀登泰山，体验其壮丽景色，并在傍晚时分到达天外村。","travel_suggestion":"穿着舒适的鞋子，携带足够的水和食物，注意保持体力。泰山天气变化无常，请根据天气预报准备合适的衣物。","accommodation":"推荐入住泰山脚下的酒店或民宿，便于第二天继续游览。","food_recommendation":"尝试当地特色菜如泰山三美汤、泰山豆腐宴等，以及各种地方小吃。"}}],"attraction_maps":[]}}'

import type {StreamResult, TravelPlan} from "../model/model.ts";

const data = JSON.parse(travelPlanData.slice(6)) as StreamResult;
</script>

<template>
  <travel-plan-box :travel-plan="data.content as TravelPlan" />
</template>

<style scoped>

</style>