export class UIManager {
    constructor() {
        // 获取DOM元素
        this.participantCountElement = document.getElementById('participantCount');
        this.audioBtn = document.getElementById('toggleAudio');
        this.videoBtn = document.getElementById('toggleVideo');
        this.screenBtn = document.getElementById('toggleScreen');
        this.leaveBtn = document.getElementById('leaveButton');
        this.hangupBtn = document.getElementById('hangupButton'); // 添加挂断按钮
        
        // 初始状态
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        this.isScreenSharing = false;

        // 添加按钮点击动画
        [this.audioBtn, this.videoBtn, this.screenBtn, this.leaveBtn, this.hangupBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.addClickEffect(btn));
            }
        });
    }

    addClickEffect(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    updateParticipantCount(count) {
        if (this.participantCountElement) {
            this.participantCountElement.textContent = `参与者: ${count}`;
        }
    }

    // 这些方法将在 App 类中被重写
    handleAudioToggle = async () => {
        console.log('Audio toggle clicked - waiting for implementation');
    }

    handleVideoToggle = async () => {
        console.log('Video toggle clicked - waiting for implementation');
    }

    handleScreenShare = async () => {
        console.log('Screen share clicked - waiting for implementation');
    }

    handleLeave = async () => {
        console.log('Leave clicked - waiting for implementation');
    }

    // 设置事件监听器
    setupEventListeners() {
        console.log('[UI] Setting up event listeners');
        if (this.audioBtn) {
            this.audioBtn.addEventListener('click', () => this.handleAudioToggle());
        }
        if (this.videoBtn) {
            this.videoBtn.addEventListener('click', () => this.handleVideoToggle());
        }
        if (this.screenBtn) {
            this.screenBtn.addEventListener('click', () => this.handleScreenShare());
        }
        if (this.leaveBtn) {
            this.leaveBtn.addEventListener('click', () => this.handleLeave());
        }
        if (this.hangupBtn) {
            this.hangupBtn.addEventListener('click', () => this.handleLeave()); // 挂断按钮也调用 handleLeave
        }
    }

    updateAudioIcon(enabled) {
        console.log(`[UI] 更新音频图标状态: ${enabled ? '启用' : '禁用'}`);
        const icon = this.audioBtn?.querySelector('i');
        if (icon) {
            icon.className = enabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
            this.audioBtn.title = enabled ? '关闭麦克风' : '开启麦克风';
            this.isAudioEnabled = enabled;
            this.audioBtn.classList.toggle('disabled', !enabled);
        }
    }

    updateVideoIcon(enabled) {
        console.log(`[UI] 更新视频图标状态: ${enabled ? '启用' : '禁用'}`);
        const icon = this.videoBtn?.querySelector('i');
        if (icon) {
            icon.className = enabled ? 'fas fa-video' : 'fas fa-video-slash';
            this.videoBtn.title = enabled ? '关闭摄像头' : '开启摄像头';
            this.isVideoEnabled = enabled;
            this.videoBtn.classList.toggle('disabled', !enabled);
        }
    }

    updateScreenShareIcon(isSharing) {
        console.log(`[UI] 更新屏幕共享图标状态: ${isSharing ? '共享中' : '未共享'}`);
        const icon = this.screenBtn?.querySelector('i');
        if (icon) {
            icon.className = isSharing ? 'fas fa-times' : 'fas fa-desktop';
            this.screenBtn.title = isSharing ? '停止共享' : '开始屏幕共享';
            this.isScreenSharing = isSharing;
            this.screenBtn.classList.toggle('sharing', isSharing);
        }
    }

    resetUI() {
        console.log('[UI] 重置界面状态');
        
        // 清空输入框
        const channelInput = document.getElementById('channelInput');
        const nameInput = document.getElementById('nameInput');
        if (channelInput) channelInput.value = '';
        if (nameInput) nameInput.value = '';

        // 切换显示状态
        const loginPage = document.getElementById('loginPage');
        const meetingPage = document.getElementById('meetingPage');
        
        if (meetingPage) meetingPage.style.display = 'none';
        if (loginPage) loginPage.style.display = 'block';
    }
}

export const uiManager = new UIManager();
// 初始化事件监听器
uiManager.setupEventListeners();
