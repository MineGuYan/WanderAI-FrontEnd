export interface message {
  userText: string,
  isLoading: boolean,
  aiText: string | TravelPlan
}

export interface StreamResult {
  type: "chat" | "plan" | "all" | "end" | "error",
  content: string | TravelPlan
}

export interface HistoryChat {
  title: string,
  sessionId: string
}

export interface HistoryMessage {
  type: "chat" | "plan" | "human",
  message: string | TravelPlan
}

export interface HotSpot {
  name: string,
  description: string,
  image: string
}

// 旅行规划相关类型定义
export interface TravelPlan {
  summary_result: SummaryResult
  daily_schedules: DailySchedule[],
  executor_results: ExecutorResult[],
  attraction_maps: AttractionMap[],
}

export interface SummaryResult {
  title: string,
  overview: OverView,
}

export interface OverView {
  duration: string,
  attraction_count: number,
  total_distance: string
}

export interface DailySchedule {
  day: number,
  activities: string[]
}

export interface ExecutorResult {
  day: number
  routes: Route[]
  attraction_details: AttractionDetail[]
  remark_cards: RemarkCards
}

export interface Route {
  origin: string,
  destination: string,
  transport: string,
  distance: string,
  duration: string,
}

export interface AttractionDetail {
  attraction: string,
  address: string,
  coordinates: string,
  introduction: string,
}

export interface RemarkCards {
  trip_feature: string,
  arrangement_description: string,
  travel_suggestion: string,
  accommodation: string,
  food_recommendation: string,
}

export interface AttractionMap {
  attraction: string,
  static_map_url: string,
}