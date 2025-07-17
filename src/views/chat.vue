<script setup lang="ts">
import '../assets/iconfont/iconfont.css'
import api from '../api/request.ts'
import { ref, onMounted, watch } from 'vue'
import { marked } from "marked";
import { markedHighlight } from "marked-highlight"
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import type {HistoryChat, message, StreamResult, HistoryMessage, TravelPlan} from "../model/model.ts";
import {ElMessageBox} from "element-plus";
import TravelPlanBox from "../components/TravelPlanBox.vue";

let sessionId: string
let chatting: boolean = false
const SidebarIsHiden = ref(true)
const uerInput = ref('')
const messages = ref<message[]>([])
const title = ref('')
const historyChats = ref<HistoryChat[]>([])
const settingsDialogVisible = ref(false);
const feedbackDialogVisible = ref(false);
const nickname = ref(localStorage.getItem('nickname') || '未设置昵称');
const accountId = ref(localStorage.getItem('accountId') || '未设置账号');
const feedbackContent = ref('');

async function createSession() {
  const response = await api.get("/chat/create")
  sessionId = response.data.data.sessionId
}

async function getHistoryChats() {
  const response = await api.get("/history/chatList")
  historyChats.value = response.data.data as HistoryChat[]
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
        // "Authentication": localStorage.getItem('token'),
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        message: messages.value[messages.value.length - 1].userText,
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

          if (data.type === "chat") {
            // 追加内容到AI消息
            content+=data.content;
            messages.value[messages.value.length - 1].aiText = marked(content) as string
          } else if (data.type === "plan") {

          } else if (data.type === "all") {
            messages.value[messages.value.length - 1].aiText = data.content as TravelPlan
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

  await getTitle()
}

async function getTitle() {
  if (title.value !== '') return;

  try {
    const response = await api.get('/history/chatTitle',{
      params: {
        sessionId: sessionId
      }
    })
    if (response.data.code === 200) {
      title.value = response.data.data.title || '未命名对话';
    } else {
      console.error('获取标题失败:', response.data.message);
    }
  } catch (error) {
    console.error('请求标题时发生错误:', error);
  }
}

async function getChatHistory(chat: HistoryChat) {
  if (!chat) return
  sessionId = chat.sessionId
  title.value = chat.title
  const response = await api.get('/history/chatContent',{
    params: {
      sessionId: sessionId
    }
  })
  messages.value=[]
  const history = response.data.data as HistoryMessage[]
  for (const item of history) {
    if (item.type === 'ai') {
      messages.value[messages.value.length - 1].aiText = marked(item.content) as string
    } else {
      messages.value.push({
        userText: item.content,
        isLoading: false,
        aiText: ''
      })
      continue
    }
  }
}

function showSidebar() {
  SidebarIsHiden.value = false
}

function hideSidebar() {
  SidebarIsHiden.value = true
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

function handleCommand(command: string) {
  switch(command) {
    case 'settings':
      showSettings();
      break;
    case 'feedback':
      showFeedback();
      break;
    case 'logout':
      logout();
      break;
  }
}

function showSettings() {
  settingsDialogVisible.value = true;
}

function showFeedback() {
  feedbackDialogVisible.value = true;
}

function logout() {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('nickname')
    localStorage.removeItem('accountId')
    window.location.href = '/'
  }).catch(() => {
    console.log('用户取消退出');
  });
}

function cancelSettings() {
  nickname.value = localStorage.getItem('nickname') || '未设置昵称';
  settingsDialogVisible.value = false;
}

async function saveSettings() {
  if( nickname.value.trim() === '') {
    await ElMessageBox.alert('昵称不能为空', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
    return;
  }

  if(nickname.value !== localStorage.getItem('nickname')) {
    try {
      const response = await api.post('/user/nickname', {
        nickname: nickname.value
      });
      if (response.data.code === 200) {
          localStorage.setItem('nickname', nickname.value);
          await ElMessageBox.alert('昵称已更新', '提示', {
            confirmButtonText: '确定',
            type: 'success'
          });
          settingsDialogVisible.value = false;
        } else {
          nickname.value = localStorage.getItem('nickname') || '未设置昵称';
          await ElMessageBox.alert('更新昵称失败，请稍后再试', '提示', {
            confirmButtonText: '确定',
            type: 'error'
          });
        }
    } catch(error) {
      nickname.value = localStorage.getItem('nickname') || '未设置昵称';
      console.error('更新昵称请求失败:', error);
      await ElMessageBox.alert('更新昵称请求失败，请稍后再试', '提示', {
        confirmButtonText: '确定',
        type: 'error'
      });
    }
  }
}

function cancelFeedback() {
  feedbackContent.value = '';
  feedbackDialogVisible.value = false;
}

async function confirmFeedback() {
  if (feedbackContent.value.trim() === '') {
    await ElMessageBox.alert('反馈内容不能为空', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
    return;
  }

  try {
    const response = await api.post('/suggession', {
      message: feedbackContent.value
    });

    if (response.data.code === 200) {
      await ElMessageBox.alert('感谢您的反馈！', '提示', {
        confirmButtonText: '确定',
        type: 'success'
      });
      feedbackContent.value = '';
      feedbackDialogVisible.value = false;
    } else {
      await ElMessageBox.alert('提交反馈失败，请稍后再试', '提示', {
        confirmButtonText: '确定',
        type: 'error'
      });
    }
  } catch (error) {
    console.error('提交反馈请求失败:', error);
    await ElMessageBox.alert('提交反馈请求失败，请稍后再试', '提示', {
      confirmButtonText: '确定',
      type: 'error'
    });
  }
}

watch(nickname, (newValue) => {
  if (newValue.length > 20) {
    nickname.value = newValue.slice(0, 20);
    ElMessageBox.alert('昵称不能超过20个字符', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    });
  }
});

onMounted(() => {
  createSession()
  getHistoryChats()

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
  <!-- 未展开的侧边栏 -->
  <div class="sidebar" v-show="SidebarIsHiden">
    <ul>
      <li><i class="iconfont icon-ai" @click="showSidebar"></i></li>
      <li><i class="iconfont icon-zhankaicebianlan" @click="showSidebar" title="打开边栏"></i></li>
      <li><i class="iconfont icon-duihuakuang" @click="createNewChat" title="开启新对话"></i></li>
    </ul>
    <!-- 用户下拉菜单 -->
    <el-dropdown class="user-settingmenu" trigger="click" @command="handleCommand" title="个人信息及反馈">
      <span class="el-dropdown-link avatar">
        用户
      </span>
      <!-- 下拉菜单内容 -->
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="settings">
            <span>账户设置</span>
          </el-dropdown-item>
          <el-dropdown-item command="feedback">
            <span>意见反馈</span>
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <router-link to="/" class="button">
      <i class="bottom iconfont icon-tuichu1" title="返回主页"></i>
    </router-link>
  </div>

  <!-- 展开的侧边栏 -->
  <div class="open_sidebar" v-show="!SidebarIsHiden">
    <div class="opensidebar-header">
      <span class="opensidebar-title">漫游精灵</span>
      <i class="iconfont icon-shouqicebianlan" @click="hideSidebar" title="关闭边栏"></i>
    </div>
    <div class="open_dialogue">
      <i class="iconfont icon-duihuakuang" id="newChatButton" @click="createNewChat"></i>
      <label class="open_dialogue_title" for="newChatButton">开启新对话</label>
    </div>
    <ul class="history-dialogue">
      历史对话
      <li v-for="chat in historyChats" :key="chat.sessionId" @click="getChatHistory(chat)">
        {{ chat.title || '未命名对话' }}
<!--          <router-link :to="{ path: '/chat', query: { sessionId: chat.sessionId } }">-->
<!--            {{ chat.title || '未命名对话' }}-->
<!--          </router-link>-->
      </li>
    </ul>
    <el-dropdown class="user-settingmenu" trigger="click" @command="handleCommand" title="个人信息及反馈">
      <div class="user-information">
        <span class="el-dropdown-link avatar">
          用户
        </span>
        <span class="personal_information">个人信息</span>
      </div>
      <!-- 下拉菜单内容 -->
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="settings">
            <span>账户设置</span>
          </el-dropdown-item>
          <el-dropdown-item command="feedback">
            <span>意见反馈</span>
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <router-link to="/" class="button">
      <i class="bottom iconfont icon-tuichu1"></i>
      <span>返回主页</span>
    </router-link>
  </div>

  <div v-if="title!==''">{{title}}</div>

  <div class="chatting">
    <div class="header-container">
      <span class="iconfont icon-ai"></span>
      <h1>漫游精灵——WanderAI</h1>
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
<!--        <span v-show="!message.isLoading" class="bubble ai-bubble" v-html="message.aiText" ></span>-->
        <span v-show="!message.isLoading" class="bubble ai-bubble">
          <span v-if="typeof message.aiText === 'string'" v-html="message.aiText"></span>
          <travel-plan-box v-else :travel-plan="message.aiText as TravelPlan" />
        </span>
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

  <!-- 账户设置对话框 -->
  <el-dialog
    v-model="settingsDialogVisible"
    title="账户设置"
    width="50%"
    :close-on-click-modal="false"
  >
    <!-- 对话框内容 -->
    <div>
      <p>昵称：</p>
      <el-input v-model="nickname" placeholder="请输入昵称"></el-input>
    </div>
    <div>
      <p>账号：</p>
      <el-input v-model="accountId" disabled></el-input>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelSettings">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 意见反馈对话框 -->
  <el-dialog
    v-model="feedbackDialogVisible"
    title="账户设置"
    width="50%"
    :close-on-click-modal="false"
  >
    <!-- 对话框内容 -->
    <div>
      <textarea placeholder="请输入反馈意见..." v-model="feedbackContent"></textarea>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelFeedback">取消</el-button>
        <el-button type="primary" @click="confirmFeedback">确定</el-button>
      </span>
    </template>
  </el-dialog>
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
.sidebar .icon-ai {
  font-size: 45px;
}
.user-settingmenu {
  /*将元素的位置设为绝对定位，相对于其最近的定位父元素进行定位*/
  position: absolute;
  top: 80vh;
  /*vh是视口高度的单位，即整个显示界面的高度共100vh*/
  left:50%;
  transform: translateX(-50%);
  cursor: pointer;
}
.user-settingmenu .avatar {
  background-color: #0ce5bb;
  color: #f8f8f8;
  border-color: #0ce8ad;
}
.sidebar .button{
  position: absolute;
  left: 50%;
  transform: translateX(-60%);
  bottom: 40px;
  text-decoration: none;
}
.sidebar .button i {
  font-size: 40px;
}


.open_sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100%;
  background-color: #f0f4fb;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);
  padding-top: 0; /* 移除原有的padding-top */
}

/* 新增的侧边栏头部样式 */
.opensidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 15px;
  height: 60px;
  background-color: #007bff;
  color: #fff;
  border-bottom: 1px solid #0056b3;
}

.opensidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.opensidebar-header .iconfont {
  font-size: 26px; /* 与标题相匹配的字体大小 */
  color: #fff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.opensidebar-header .iconfont:hover {
  color: #ffd700; /* 悬停时变为金色 */
}

.open_dialogue {
  width: 80%;
  height: 6%;
  margin: 20px auto 0 auto; /* 改为auto实现水平居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /*气泡设置*/
  border-radius: 18px;
  background-color: #9cdbf1;
}
.open_dialogue i {
  font-size: 34px;
  color: #0095ff;
  margin-right: 10px;
}
.open_dialogue_title {
  font-size: 14px;
  color: #007bff;
}

.history-dialogue {
  position: absolute;
  top:20%;
  left:50%;
  transform:translateX(-50%);
}
.open_sidebar .user-settingmenu{
  width:100%;
}
.user-information {
  width:100%;
  display:flex;
  /*主轴对齐*/
  justify-content: center;
  /*交叉轴对齐*/
  align-items: center;
  gap: 10px;
  cursor:pointer;
}
.open_sidebar .personal_information{
  font-size: 18px;
  color: #000000;
}
.open_sidebar .button{
  width:100%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
  text-decoration: none;
  display:flex;
   /*主轴对齐*/
  justify-content: center;
  /*交叉轴对齐*/
  align-items: center;
  gap: 20px;
  cursor:pointer;
}
.open_sidebar .button i {
  font-size: 46px;
}
.open_sidebar .button span {
  font-size: 18px;
  color: #000000;
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
  width: 70%;
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