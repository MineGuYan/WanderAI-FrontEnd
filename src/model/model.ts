export interface message {
  userType: "chat" | "image",
  userMessage: string | ImageMessage,
  isLoading: boolean,
  aiType: "chat" | "plan" | "audio",
  aiMessage: string | TravelPlan | AudioMessage,
}

export interface StreamResult {
  type: "chat" | "plan" | "all" | "end" | "error",
  content: string | TravelPlan
}

export interface AudioStreamResult {
  type: "chat" | "error" | "end" | "audio",
  content: string
}

export interface HistoryChat {
  title: string,
  sessionId: string
}

export interface HistoryMessage {
  role: "ai" | "human",
  type: "chat" | "plan" | "image" | "audio",
  message: string | TravelPlan | ImageMessage | AudioMessage,
}

export interface ImageMessage {
  image_url: string,
  text: string,
}

export interface AudioMessage {
  audio_url: string,
  text: string,
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
  weather_vo: WeatherVo,
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
  attractions: string[]
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

export interface WeatherVo {
  province: string,
  city: string,
  weathers: Weather[],
}

export interface Weather {
  date: string,
  max_degree: string,
  min_degree: string,
  day_weather: string,
}