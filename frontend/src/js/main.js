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

// 当页面加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] 页面加载完成，初始化应用');
    window.app = new App();
});
