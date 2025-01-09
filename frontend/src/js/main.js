import { agoraManager } from './agoraManager.js';
import { uiManager } from './uiManager.js';

class App {
    constructor() {
        this.loginPage = document.getElementById('loginPage');
        this.meetingPage = document.getElementById('meetingPage');
        this.channelInput = document.getElementById('channelInput');
        this.nameInput = document.getElementById('nameInput');
        this.joinButton = document.getElementById('joinButton');

        this.setupEventListeners();
        this.initializeAgora();
    }

    async initializeAgora() {
        const initialized = await agoraManager.initialize();
        if (!initialized) {
            alert('Agora 初始化失败');
        }
    }

    setupEventListeners() {
        this.joinButton.addEventListener('click', () => this.handleJoin());

        // 重写 UIManager 的方法
        uiManager.handleAudioToggle = async () => {
            const isEnabled = await agoraManager.toggleAudio();
            document.querySelector('#toggleAudio i').className = 
                isEnabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
        };

        uiManager.handleVideoToggle = async () => {
            const isEnabled = await agoraManager.toggleVideo();
            document.querySelector('#toggleVideo i').className = 
                isEnabled ? 'fas fa-video' : 'fas fa-video-slash';
        };

        uiManager.handleScreenShare = async () => {
            const isSharing = await agoraManager.toggleScreenShare();
            document.querySelector('#toggleScreen i').className = 
                isSharing ? 'fas fa-times' : 'fas fa-desktop';
        };

        uiManager.handleLeave = async () => {
            await this.handleLeave();
        };
    }

    async handleJoin() {
        const channelId = this.channelInput.value.trim();
        const userName = this.nameInput.value.trim();

        if (!channelId || !userName) {
            alert('请输入会议ID和用户名');
            return;
        }

        const joined = await agoraManager.joinChannel(channelId);
        if (joined) {
            this.loginPage.style.display = 'none';
            this.meetingPage.style.display = 'flex';
        } else {
            alert('加入频道失败');
        }
    }

    async handleLeave() {
        await agoraManager.leaveChannel();
        this.meetingPage.style.display = 'none';
        this.loginPage.style.display = 'flex';
    }
}

// 当页面加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
