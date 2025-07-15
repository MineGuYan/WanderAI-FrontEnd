<script setup lang="ts">
import '../assets/iconfont/iconfont.css'
import api from '../api/request.ts'
import {type Ref, ref, onMounted} from 'vue'
import {marked} from "marked";
import { markedHighlight } from "marked-highlight"
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

type message = {
  userText: string,
  isLoading: boolean,
  aiText: string
}

export interface StreamResult {
  type: "chunk" | "end" | "error";
  content: string;
}

let llm: string[]
let sessionId: string
let chatting: boolean = false
const currentModel = ref('')
const uerInput = ref('')
const messages: Ref<message[]> = ref([])

async function getModels() {
  const response = await api.get("/chat/models")
  llm = response.data.data
  currentModel.value = llm[0]
}

async function createSession() {
  const response = await api.get("/chat/create")
  sessionId = response.data.data.sessionId
}

async function sendMessage() {
  if (uerInput.value === '')return
  if (chatting)return

  messages.value.push({
    userText: uerInput.value,
    isLoading: true,
    aiText: ''
  })

  uerInput.value = ''

  const baseURL = api.defaults.baseURL || "";
  try {
    chatting = true

    const response = await fetch(`${baseURL}/chat/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        message: messages.value[messages.value.length - 1].userText,
        model: currentModel.value
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 处理流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("无法获取响应流")
    }

    messages.value[messages.value.length - 1].isLoading = false

    const decoder = new TextDecoder()
    let content = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6)) as StreamResult;

          if (data.type === "chunk") {
            // 追加内容到AI消息
            content+=data.content;
            messages.value[messages.value.length - 1].aiText = marked(content) as string
          } else if (data.type === "end") {
            break
          } else if (data.type === "error") {
            console.error(`对话出错: ${data.content}`)
            break
          }
        }
      }
    }
  }catch (error){
    messages.value[messages.value.length - 1].isLoading = false
    messages.value[messages.value.length - 1].aiText = '<span style="color: red;">服务器繁忙，请稍后再试。</span>'
    console.error(error)
  }finally {
    chatting = false
  }
}

function handleEnter(e: KeyboardEvent) {
  e.preventDefault();
  sendMessage();
}

function handleShiftEnter() {
  // 允许换行
}

function createNewChat(){
  createSession()
  messages.value=[]
}

onMounted(() => {
  getModels()
  createSession()

  marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      const language = hljs.getLanguage(lang) ? lang : 'shell'
      return hljs.highlight(code, { language }).value
    }
  }))
})
</script>

<template>
  <div class="sidebar">
    <ul>
      <li><i class="iconfont icon-ai"></i></li>
      <li><i class="iconfont icon-zhankaicebianlan"></i></li>
      <li><i class="iconfont icon-duihuakuang" @click="createNewChat"></i></li>
    </ul>
    <router-link to="/" class="button">
      <i class="bottom iconfont icon-tuichu"></i>
    </router-link>
  </div>

  <select class="change-model" v-model="currentModel" id="llm-select">
    <option v-for="model in llm">{{ model }}</option>
  </select>

  <div class="chatting">
    <div class="header-container">
      <span class="iconfont icon-ai"></span>
      <h1>AI聊天助手</h1>
    </div>
    <p>你好，我是你的AI助手！请问有什么可以帮助你的吗？</p>
    <hr>
    <div v-for="message in messages">
      <div class="message-container user-message">
        <span class="bubble user-bubble">{{ message.userText }}</span>
        <span class="avatar user-avatar">用户</span>
      </div>
      <div class="message-container ai-message">
        <span class="avatar ai-avatar">AI</span>
        <span v-show="message.isLoading" class="loading-spinner"></span>
        <span v-show="!message.isLoading" class="bubble ai-bubble" v-html="message.aiText" ></span>
      </div>
    </div>
    <div class="write-block"></div>
  </div>

  <div class="input-box">
    <textarea placeholder="向AI助手发送信息..."
              v-model="uerInput"
              @keydown.enter.exact="handleEnter"
              @keydown.shift.enter="handleShiftEnter"></textarea>
    <i class="iconfont icon-jiantou2-copy-copy" @click="sendMessage()"></i>
  </div>

</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100px;
  height: 100%;
  background-color: #212327;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);
  padding-top: 20px;
}
li {
  text-align: center;
  margin-bottom: 50px;
  list-style: none;
}
i{
  font-size: 40px;
  color: #0ce5bb;
  cursor: pointer;
}
.sidebar .button{
  position: absolute;
  text-align: center;
  bottom: 80px;
}
.sidebar .button i {
  font-size: 40px;
  margin-left: 20px;
}

.change-model {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 12px;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 5px;
  background-color: white;
  color: #333;
  cursor: pointer;
  z-index: 1000;
}

.chatting {
  text-align: center;
  margin: 20px auto;
  max-width: 70%;
}

.header-container {
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.header-container .iconfont{
  margin-bottom: 8px;
  color: #007bff;
  font-size: 42px;
  margin-right: 10px;
}
.chatting h1{
  color: #007bff;
  font-size: 34px;
  margin-bottom: 10px;
}
.chatting p {
  font-size: 18px;
  color: #3e3a3a;
}
hr{
  margin-bottom: 20px;
}


.bubble {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.4;
  position: relative;
  word-wrap: break-word;
}

.ai-bubble {
  background-color: #efecec;
  color: #0e0b0b;
  border-top-left-radius: 4px;
  text-align: left;
  margin-left: 10px;
  max-width: 90%;
}
.ai-bubble :deep(p){
  margin-top: 0;
  margin-bottom: 0;
}

.user-bubble {
  background-color: #bdf6e8;
  color: #090707;
  border-top-right-radius: 4px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
  border: 2px solid #ddd;
}

.user-avatar {
  margin-left: 10px;
  background-color: #0ce5bb;
  color: #f8f8f8;
  border-color: #0ce8ad;
}

.ai-avatar {
  font-size: 20px;
  margin-right: 10px;
  background-color: #f8f9fa;
  color: #333;
  border-color: #6c757d;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-top: 10px;
  margin-left: 10px;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


.message-container {
  display: flex;
  align-items: flex-start;
  margin-top: 30px;
  margin-bottom: 30px;
}

.user-message {
  font-size: 18px;
  justify-content: flex-end;
}

.ai-message {
  font-size:18px;
  justify-content: flex-start;
}

.write-block{
  height: 150px;
}

.input-box {
  text-align: center;
  background-color: #ffffff;
  position: fixed;
  bottom: 20px;
  left: 53%;
  transform: translateX(-50%);
  width: 80%;
}

textarea {
  border: 2px solid #2dbdea;
  font-size: 20px;
  resize: none;
  width: 90%;
  height: 100px;
  padding: 10px;
  padding-right: 60px;
  border-radius: 5px;
}

.input-box i {
  position: absolute;
  bottom: 10px;
  right: 2px;
  font-size: 40px;
  cursor: pointer;
  color: #ffffff;
  background-color: #007bff;
  border-radius: 50%;
  border-color: #007bff;
}

</style>