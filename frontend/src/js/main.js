import { agoraManager } from './agoraManager.js';
import { uiManager } from './uiManager.js';

class App {
    constructor() {
        this.loginPage = document.getElementById('loginPage');
        this.meetingPage = document.getElementById('meetingPage');
        this.channelInput = document.getElementById('channelInput');
        this.nameInput = document.getElementById('nameInput');
        this.joinButton = document.getElementById('joinButton');

        this.initializeAgora().then(() => {
            console.log('[App] Agora 初始化完成，设置事件监听器');
            this.setupEventListeners();
        }).catch(error => {
            console.error('[App] Agora 初始化失败:', error);
            alert('初始化失败，请刷新页面重试');
        });
    }

    async initializeAgora() {
        console.log('[App] 开始初始化 Agora');
        const initialized = await agoraManager.initialize();
        if (!initialized) {
            throw new Error('Agora 初始化失败');
        }
        return initialized;
    }

    setupEventListeners() {
        console.log('[App] 设置事件监听器');
        this.joinButton.addEventListener('click', () => {
            console.log('[App] 点击加入按钮');
            this.handleJoin();
        });

        // 重写 UIManager 的方法
        // 注意：使用箭头函数来保持 this 的正确绑定
        uiManager.handleAudioToggle = async () => {
            console.log('[App] 触发音频切换');
            try {
                const enabled = await agoraManager.toggleAudio();
                console.log('[App] 音频切换结果:', enabled);
                if (enabled !== undefined) {
                    uiManager.updateAudioIcon(enabled);
                }
            } catch (error) {
                console.error('[App] 音频切换失败:', error);
                alert('音频切换失败，请检查麦克风权限');
            }
        };

        uiManager.handleVideoToggle = async () => {
            console.log('[App] 触发视频切换');
            try {
                const enabled = await agoraManager.toggleVideo();
                console.log('[App] 视频切换结果:', enabled);
                if (enabled !== undefined) {
                    uiManager.updateVideoIcon(enabled);
                }
            } catch (error) {
                console.error('[App] 视频切换失败:', error);
                alert('视频切换失败，请检查摄像头权限');
            }
        };

        uiManager.handleScreenShare = async () => {
            console.log('[App] 触发屏幕共享切换');
            try {
                const isSharing = await agoraManager.toggleScreenShare();
                console.log('[App] 屏幕共享切换结果:', isSharing);
                if (isSharing !== undefined) {
                    uiManager.updateScreenShareIcon(isSharing);
                }
            } catch (error) {
                console.error('[App] 屏幕共享切换失败:', error);
                alert('屏幕共享切换失败，请检查权限');
            }
        };

        uiManager.handleLeave = async () => {
            console.log('[App] 触发离开会议');
            try {
                await this.handleLeave();
            } catch (error) {
                console.error('[App] 离开会议失败:', error);
                alert('离开会议失败');
            }
        };
    }

    async handleJoin() {
        console.log('[App] 处理加入会议请求');
        const channelId = this.channelInput.value.trim();
        const userName = this.nameInput.value.trim();

        if (!channelId || !userName) {
            console.warn('[App] 会议ID或用户名为空');
            alert('请输入会议ID和用户名');
            return;
        }

        try {
            console.log('[App] 尝试加入频道:', channelId, '用户名:', userName);
            const joined = await agoraManager.joinChannel(channelId, null, userName);
            if (joined) {
                console.log('[App] 成功加入频道');
                this.loginPage.style.display = 'none';
                this.meetingPage.style.display = 'flex';

                // 更新按钮初始状态
                uiManager.updateAudioIcon(true);
                uiManager.updateVideoIcon(true);
                uiManager.updateScreenShareIcon(false);
            } else {
                console.error('[App] 加入频道失败');
                alert('加入频道失败');
            }
        } catch (error) {
            console.error('[App] 加入频道时发生错误:', error);
            alert('加入频道时发生错误');
        }
    }

    async handleLeave() {
        console.log('[App] 处理离开会议请求');
        try {
            // 先离开频道
            await agoraManager.leaveChannel();
            console.log('[App] 成功离开频道');

            // 重置 UI 状态
            uiManager.resetUI();
        } catch (error) {
            console.error('[App] 离开频道时发生错误:', error);
            alert('离开频道时发生错误');
            // 即使发生错误也尝试重置 UI
            uiManager.resetUI();
        }
    }
}

// WebSocket连接
let ws;
let currentUser = '';
let currentChannel = '';

// 初始化WebSocket连接
function initWebSocket() {
    ws = new WebSocket('wss://' + window.location.hostname + ':3000');

    ws.onopen = () => {
        console.log('WebSocket连接已建立');
        // 发送加入消息
        ws.send(JSON.stringify({
            type: 'join',
            name: currentUser,
            channel: currentChannel
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
            appendMessage(data);
        } else if (data.type === 'file') {
            appendFile(data);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        // 可以在这里添加重连逻辑
    };
}

// 添加消息到聊天区域
function appendMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';

    const time = new Date(message.time).toLocaleTimeString();

    messageDiv.innerHTML = `
        <div class="sender">${message.sender}</div>
        <div class="content">${message.content}</div>
        <div class="time">${time}</div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 发送消息
function sendMessage() {
    const input = document.getElementById('chatInput');
    const content = input.value.trim();

    if (content && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'chat',
            content: content
        }));
        input.value = '';
    }
}

// 添加文件到文件列表
function appendFile(fileInfo) {
    const fileList = document.getElementById('fileList');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const size = (fileInfo.size / 1024).toFixed(2) + ' KB';
    const time = new Date(fileInfo.time).toLocaleTimeString();

    fileItem.innerHTML = `
        <div class="file-name">
            ${fileInfo.originalname}
            <span class="file-info">${size} - 上传者: ${fileInfo.uploader} - ${time}</span>
        </div>
        <button class="download-btn" onclick="downloadFile('${fileInfo.filename}', '${fileInfo.originalname}')">
            <i class="fas fa-download"></i>
        </button>
    `;

    fileList.appendChild(fileItem);
    fileList.scrollTop = fileList.scrollHeight;
}

// 下载文件
async function downloadFile(filename, originalname) {
    try {
        const response = await fetch('/download/' + encodeURIComponent(filename));

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '文件下载失败');
        }

        // 获取文件blob
        const blob = await response.blob();

        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalname;
        document.body.appendChild(a);
        a.click();

        // 清理
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('下载错误:', error);
        alert(error.message || '文件下载失败，请重试');
    }
}

// 处理文件上传
async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'X-Channel': currentChannel,
                'X-Username': currentUser
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '文件上传失败');
        }

        const result = await response.json();
        console.log('文件上传成功:', result);
    } catch (error) {
        console.error('文件上传错误:', error);
        alert(error.message || '文件上传失败，请重试');
    }
}

// 当页面加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] 页面加载完成，初始化应用');
    window.app = new App();

    // 获取发送按钮和输入框
    const sendButton = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    const fileInput = document.getElementById('fileInput');

    // 点击发送按钮发送消息
    sendButton.addEventListener('click', sendMessage);

    // 在输入框中按回车键发送消息
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 处理文件选择
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
            // 清空文件输入框，允许上传相同的文件
            fileInput.value = '';
        }
    });

    // 修改加入会议按钮的处理函数
    document.getElementById('joinButton').addEventListener('click', () => {
        currentChannel = document.getElementById('channelInput').value;
        currentUser = document.getElementById('nameInput').value;

        if (currentChannel && currentUser) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('meetingPage').style.display = 'flex';

            // 初始化WebSocket连接
            initWebSocket();
        }
    });
});

// 使 downloadFile 函数全局可用
window.downloadFile = downloadFile;
