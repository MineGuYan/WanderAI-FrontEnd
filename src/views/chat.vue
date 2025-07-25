<script setup lang="ts">
import '../assets/iconfont/iconfont.css'
import api from '../api/request.ts'
import { ref, onMounted, watch } from 'vue'
import { marked } from "marked";
import { markedHighlight } from "marked-highlight"
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import type {
  HistoryChat,
  message,
  StreamResult,
  HistoryMessage,
  TravelPlan,
  ImageMessage,
  AudioMessage, AudioStreamResult
} from "../model/model.ts";
import {
  Link,
} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox, type UploadUserFile} from "element-plus";
import TravelPlanBox from "../components/TravelPlanBox.vue";
import SafeImg from "../components/SafeImg.vue";

let sessionId: string = ''
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
const fileList = ref<UploadUserFile[]>([])

async function createSession() {
  try{
    const response = await api.get("/chat/create")
    sessionId = response.data.data.sessionId
  } catch (error) {
    sessionId = ''
    await ElMessageBox.alert('创建会话失败，请稍后再试', '��示', {
      confirmButtonText: '确定',
      type: 'error'
    })
  }

  await getHistoryChats()
}

async function getHistoryChats() {
  try {
    const response = await api.get("/history/chatList")
    historyChats.value = response.data.data as HistoryChat[]
  } catch (error) {
    historyChats.value = []
    console.error('获取历史对话失败:', error)
    await ElMessageBox.alert('获取历史对话失败，请稍后再试', '提示', {
      confirmButtonText: '确定',
      type: 'error'
    })
  }
}

async function chat() {
  if (chatting) {
    ElMessage.warning("正在处理上一个对话，请稍后再试")
    return
  }
  if (uerInput.value === '' && fileList.value.length === 0) {
    ElMessage.warning("请输入消息或上传图片")
    return
  }

  chatting = true

  if (sessionId === '') {
    await createSession()
  }

  console.log(fileList.value)

  if (fileList.value.length > 0) {
    const url = await uploadImage()
    if (!url) {
      await ElMessageBox.alert('图片上传失败，请稍后再试', '提示', {
        confirmButtonText: '确定',
        type: 'error'
      })
      return
    }
    messages.value.push({
      userType: 'image',
      userMessage: {
        image_url: url,
        text: uerInput.value
      } as ImageMessage,
      isLoading: true,
      aiType: 'audio',
      aiMessage: {
        audio_url: '',
        text: ''
      } as AudioMessage
    })
    uerInput.value = ''
    fileList.value = [];

    await sendImageMessage()
  } else {
    messages.value.push({
      userType: 'chat',
      userMessage: uerInput.value,
      isLoading: true,
      aiType: 'chat',
      aiMessage: ''
    })
    uerInput.value = ''

    await sendMessage()
  }

  await getTitle()
}

async function sendMessage() {
  const baseURL = api.defaults.baseURL || "";
  try {
    const response = await fetch(`${baseURL}/chat/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authentication": localStorage.getItem('token') as string,
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        message: messages.value[messages.value.length - 1].userMessage,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法获取响应流");
    }

    messages.value[messages.value.length - 1].isLoading = false;

    const decoder = new TextDecoder();
    let content = '';
    let buffer = ''; // 用于累积可能被分割的JSON数据
    let isLargeJson = false; // 标记是否正在处理大JSON数据

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk; // 累积数据

      // 处理缓冲区中的所有完整行
      let lineEnd;
      while ((lineEnd = buffer.indexOf('\n')) >= 0) {
        const line = buffer.substring(0, lineEnd).trim();
        buffer = buffer.substring(lineEnd + 1);

        if (!line.startsWith("data: ")) continue;

        const dataStr = line.slice(6);

        // 如果是大JSON数据，可能需要累积多个chunk
        if (isLargeJson || dataStr.includes('"type":"all"')) {
          try {
            // 尝试解析当前累积的数据
            const data = JSON.parse(dataStr) as StreamResult;

            if (data.type === "all") {
              // 功解析完整的大JSON数据
              messages.value[messages.value.length - 1].aiType = 'plan';
              messages.value[messages.value.length - 1].aiMessage = data.content as TravelPlan;
              isLargeJson = false;
            }
          } catch (e) {
            // 解析失败，可能是数据不完整，标记为需要累积更多数据
            isLargeJson = true;
          }
        } else {
          // 处理其他类型的数据
          try {
            const data = JSON.parse(dataStr) as StreamResult;

            if (data.type === "chat") {
              // 追加内容到AI消息
              content += data.content;
              messages.value[messages.value.length - 1].aiMessage = marked(content) as string;
            } else if (data.type === "plan") {
              messages.value[messages.value.length - 1].aiMessage = `正在${data.content}中...`;
            } else if (data.type === "end") {
              if (content) {
                content += data.content;
                messages.value[messages.value.length - 1].aiMessage = marked(content) as string;
              }
              break;
            } else if (data.type === "error") {
              console.error(`对话出错: ${data.content}`);
              break;
            }
          } catch (e) {
            console.error("解析JSON失败:", e, "数据:", dataStr);
          }
        }
      }
    }

    // 处理缓冲区中剩余的未处理数据
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer.trim()) as StreamResult;
        if (data.type === "all") {
          messages.value[messages.value.length - 1].aiType = 'plan';
          messages.value[messages.value.length - 1].aiMessage = data.content as TravelPlan;
        }
      } catch (e) {
        console.error("处理最后的数据块失败:", e);
      }
    }
  } catch (error) {
    console.error(error);
    messages.value[messages.value.length - 1].isLoading = false;
    messages.value[messages.value.length - 1].aiMessage = '<span style="color: red;">服务器繁忙，请稍后再试。</span>';
  } finally {
    chatting = false;
  }
}

async function sendImageMessage() {
  const baseURL = api.defaults.baseURL || "";
  try {
    const response = await fetch(`${baseURL}/chat/guide/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authentication": localStorage.getItem('token') as string,
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        imageUrl: (messages.value[messages.value.length - 1].userMessage as ImageMessage).image_url,
        message: (messages.value[messages.value.length - 1].userMessage as ImageMessage).text
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法获取响应流");
    }

    messages.value[messages.value.length - 1].isLoading = false;

    const decoder = new TextDecoder()
    let content = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6)) as AudioStreamResult;

          if (data.type === "chat") {
            content += data.content;
            (messages.value[messages.value.length - 1].aiMessage as AudioMessage).text = marked(content) as string
          } else if (data.type === "audio") {
            (messages.value[messages.value.length - 1].aiMessage as AudioMessage).audio_url = data.content;
          } else if (data.type === "end") {
            content += data.content;
            (messages.value[messages.value.length - 1].aiMessage as AudioMessage).text = marked(content) as string
            break
          } else {
            console.error(`对话出错: ${data.content}`)
            break
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    messages.value[messages.value.length - 1].isLoading = false;
    messages.value[messages.value.length - 1].aiMessage = '<span style="color: red;">服务器繁忙，请稍后再试。</span>';
  } finally {
    chatting = false;
  }
}

async function getTitle() {
  if (title.value !== '') return;

  try {
    const response = await api.get('/history/chatTitle',{
      params: {
        sessionId: sessionId
      }
    })
    if (response.data.code === 1) {
      title.value = response.data.data.title || '未命名对话';
    } else {
      console.error('获取标题失败:', response.data.message);
    }
  } catch (error) {
    console.error('请求标题时发生错误:', error);
  }

  await getHistoryChats()
}

async function getChatHistory(chat: HistoryChat) {
  if (!chat) return
  sessionId = chat.sessionId
  title.value = chat.title
  try {
    const response = await api.get('/history/chatContent',{
      params: {
        sessionId: sessionId
      }
    })
    messages.value=[]
    const history = response.data.data as HistoryMessage[]
    if (history.length === 0) return
    for (const item of history) {
      if (item.role === 'human') {
        messages.value.push({
          userType: item.type as 'chat' | 'image',
          userMessage: item.message as string | ImageMessage,
          isLoading: false,
          aiType: 'chat',
          aiMessage: ''
        })
      } else {
        messages.value[messages.value.length - 1].aiType = item.type as 'chat' | 'plan' | 'audio'
        if (item.type === 'chat'){
          messages.value[messages.value.length - 1].aiMessage = marked(item.message as string) as string
        } else {
          messages.value[messages.value.length - 1].aiMessage = item.message as TravelPlan | AudioMessage
        }
      }
    }
  } catch (error) {
    console.error('获取历史对话内容失败:', error)
    await ElMessageBox.alert('获取历史对话内容失败，请稍后再试', '提示', {
      confirmButtonText: '确定',
      type: 'error'
    })
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
  chat();
}

function handleShiftEnter() {
  // 允许换行
}

function createNewChat(){
  messages.value=[]
  title.value = ''
  sessionId = ''
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
      const response = await api.put('/user/nickname',{} ,{
        params:{
          newNickname: nickname.value
        }
      });
      if (response.data.code === 1) {
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
  } else {
    await ElMessageBox.alert('昵称未修改，无需保存', '提示', {
      confirmButtonText: '确定',
      type: 'info'
    });
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
    const response = await api.post('/suggestion', {
      message: feedbackContent.value
    });

    if (response.data.code === 1) {
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

async function uploadImage() {
  try {
    const response = await api.post("/upload", {
      file: fileList.value[0].raw
    }, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authentication": localStorage.getItem('token') as string
      }
    });

    if (response.data.code === 1) {
      return response.data.data
    } else {
      console.error('上传图片失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    return null;
  }
}

function handleExceed() {
  ElMessage.warning('最多只能上传一张图片');
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
    <div class="open_dialogue" @click="createNewChat">
      <i class="iconfont icon-duihuakuang"></i>
      <label class="open_dialogue_title">开启新对话</label>
    </div>
    <ul class="history-dialogue">
      历史对话
      <li v-for="chat in historyChats" :key="chat.sessionId" @click="getChatHistory(chat)" :title="chat.title || '未命名对话'">
        {{ chat.title || '未命名对话' }}
      </li>
    </ul>
    <el-dropdown class="user-settingmenu" trigger="click" @command="handleCommand">
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

  <div class="chatting">
    <div v-if="title!==''" class="dialog_title">{{title}}</div>
    <div v-else>
      <div class="header-container">
        <span class="iconfont icon-ai"></span>
        <h1>漫游精灵——WanderAI</h1>
      </div>
      <p>你好，我是你的旅行规划助手！请问有什么可以帮助你的吗？</p>
    </div>

    <hr>

    <div v-for="message in messages">
      <div class="message-container user-message">
        <span v-if="message.userType === 'chat'" class="bubble user-bubble">{{ message.userMessage }}</span>
        <span v-else class="bubble user-bubble">
          <SafeImg :url="(message.userMessage as ImageMessage).image_url" class="show-image"></SafeImg>
          <span class="output-message">{{ (message.userMessage as ImageMessage).text }}</span>
        </span>
        <span class="avatar user-avatar">用户</span>
      </div>

      <div class="message-container ai-message">
        <span class="avatar ai-avatar">AI</span>
        <span v-show="message.isLoading" class="loading-spinner"></span>
        <span v-show="!message.isLoading" class="bubble ai-bubble">
          <span v-if="message.aiType === 'chat'" v-html="message.aiMessage"></span>
          <travel-plan-box class="travel-plan-box" v-else-if="message.aiType === 'plan'" :travel-plan="message.aiMessage as TravelPlan" />
          <span v-else>
            <span v-html="(message.aiMessage as AudioMessage).text"></span>
            <audio v-if="(message.aiMessage as AudioMessage).audio_url" :src="(message.aiMessage as AudioMessage).audio_url " controls class="show-audio"></audio>
          </span>
        </span>
      </div>
    </div>
    <div class="write-block"></div>
  </div>

  <div class="input-box">
    <textarea placeholder=" 向AI助手发送信息..."
              v-model="uerInput"
              @keydown.enter.exact="handleEnter"
              @keydown.shift.enter="handleShiftEnter">
    </textarea>
    <div class="input-controls">
      <el-upload class="input-image" v-model:file-list="fileList" accept="image/*" :limit="1" :on-exceed="handleExceed" :auto-upload="false">
        <el-icon class="link_icon"><Link /></el-icon>
      </el-upload>
      <i class="iconfont icon-jiantou2-copy-copy" @click="chat()"></i>
    </div>
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
      <p><strong>昵称: </strong></p>
      <el-input v-model="nickname" placeholder="请输入昵称"></el-input>
    </div>
    <div>
      <p class="account"><strong>账号：</strong></p>
      <el-input v-model="accountId" disabled></el-input>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button class="cancel-button" @click="cancelSettings">取消</el-button>
        <el-button class="save-button" type="primary" @click="saveSettings">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 意见反馈对话框 -->
  <el-dialog
    v-model="feedbackDialogVisible"
    title="意见反馈"
    width="50%"
    :close-on-click-modal="false"
  >
    <!-- 对话框内容 -->
    <div>
      <textarea class="textarea" placeholder="请输入反馈意见..." v-model="feedbackContent"></textarea>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button class="cancel-button" @click="cancelFeedback">取消</el-button>
        <el-button class="confirm-button" type="primary" @click="confirmFeedback">确定</el-button>
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
  top: 82vh;
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
  cursor: pointer;
}

.history-dialogue {
  text-align: center;
  position: absolute;
  top: 16%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 60%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px 10px;
  margin-bottom: 30px;
  overflow-y: auto;
  font-size: 20px;
  font-weight: bold;
  color: #0bbaf1;
}

.history-dialogue li {
  list-style: none;
  padding: 10px 12px;
  margin-top: 12px;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  color: #333;
}

.history-dialogue li:hover {
  background-color: rgba(0, 123, 255, 0.1);
  transform: translateX(3px);
}

.history-dialogue li:last-child {
  margin-bottom: 0;
}

/* 自定义滚动条样式 */
.history-dialogue::-webkit-scrollbar {
  width: 6px;
}

.history-dialogue::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.history-dialogue::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.6);
  border-radius: 3px;
}

.history-dialogue::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 123, 255, 0.8);
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
  bottom: 40px;
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
.dialog_title{
  font-size:34px;
  font-weight:600;
  color: #006fff;
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
.travel-plan-box {
  min-width: 920px;
}

.user-bubble {
  max-width: 1000px;
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


.user-message {
  font-size: 18px;
  justify-content: flex-end;
}

.user-message .show-image{
  display: block;
  max-width: 940px;
  margin-left:auto;
  margin-right:auto;
  margin-bottom: 10px;
}

.message-container {
  display: flex;
  align-items: flex-start;
  margin-top: 30px;
  margin-bottom: 30px;
}

.message-container .show-audio{
  display: block;
}

.message-container .output-message{
  display: block;
  text-align: left;
  /*块级元素，独占一行，此时text-align: left才生效，因为，text-align只对块级元素的内容对齐方式有效*/
}

.ai-message {
  font-size:18px;
  justify-content: flex-start;
}

.write-block{
  height: 150px;
}

.input-box {
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background-color: transparent;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 64%;
}

textarea {
  resize: none;
}

.input-box textarea {
  z-index: 1000;
  border: 2px solid #2dbdea;
  font-size: 20px;
  flex: 1;
  height: 110px;
  margin: 0;
  padding-left: 4px; /* 添加左内边距，相当于两个空格的宽度 */
  box-sizing: border-box;
  /*使用 box-sizing: border-box; 后，元素的宽度和高度将包括内容、内边距和边框。即使你设置了元素的宽度为 100px，这个宽度就包括了内边距和边框，
  内容区域的宽度会自动调整，以便保持元素的总宽度为 100px。这样可以避免一些布局上的计算错误，使得布局更容易控制。*/
  border-radius: 16px;
}

.input-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  z-index: 1000;
}

.input-image {
  z-index: 1000;
}

.input-box i {
  z-index: 1000;
  font-size: 40px;
  cursor: pointer;
  color: #ffffff;
  background-color: #007bff;
  border-radius: 50%;
}
.input-box .link_icon{
  font-size:36px;
}

/* 显示上传组件的文件列表，并让其向上显示 */
.input-image :deep(.el-upload-list) {
  display: block;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}
.account{
  margin-top:16px;
}
.textarea{
  font-size:18px;
  padding:10px;
  width: 100%;
  height: 200px;
}
.dialog-footer .cancel-button{
  height:36px;
  width:50px;
}
.dialog-footer .confirm-button{
  height:36px;
  width:50px;
}
.dialog-footer .save-button{
    height:36px;
  width:50px;
}
</style>