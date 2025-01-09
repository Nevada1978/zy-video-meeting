export class UIManager {
    constructor() {
        this.participantCountElement = document.getElementById('participantCount');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 设置各种UI事件监听器
        document.getElementById('toggleAudio').addEventListener('click', this.handleAudioToggle.bind(this));
        document.getElementById('toggleVideo').addEventListener('click', this.handleVideoToggle.bind(this));
        document.getElementById('toggleScreen').addEventListener('click', this.handleScreenShare.bind(this));
        document.getElementById('leaveButton').addEventListener('click', this.handleLeave.bind(this));
    }

    updateParticipantCount(count) {
        if (this.participantCountElement) {
            this.participantCountElement.textContent = `参与者: ${count}`;
        }
    }

    handleAudioToggle() {
        // 这些方法将在主应用程序中被重写
        console.log('Audio toggle clicked');
    }

    handleVideoToggle() {
        console.log('Video toggle clicked');
    }

    handleScreenShare() {
        console.log('Screen share clicked');
    }

    handleLeave() {
        console.log('Leave clicked');
    }
}

export const uiManager = new UIManager();
