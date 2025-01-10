import { uiManager } from './uiManager.js';

export class AgoraManager {
    constructor() {
        this.client = null;
        this.localAudioTrack = null;
        this.localVideoTrack = null;
        this.screenTrack = null;
        this.remoteUsers = new Map();
        this.userName = '';

        // Agora 配置
        // 在 Agora 控制台中创建应用，并获取 appId 和 token
        // 这里是整的本地的临时的token
        this.appId = 'e20eed62fec44c37a7dbeca6fbd4da22';
        this.token = '007eJxTYGDlqXv8cMs57zOnZsWd9ZDLWPw4dlHBbz9FD0XrjxNFPhxQYEg1MkhNTTEzSktNNjFJNjZPNE9JSk1ONEtLSjFJSTQyOvmwPr0hkJFh/dMXDIxQCOKzMRgaGZuYmjEwAABFQyLI';
        this.channelParameters = {
            localAudioTrack: null,
            localVideoTrack: null,
            remoteAudioTrack: null,
            remoteVideoTrack: null,
            remoteUid: null,
        };
    }

    async initialize() {
        try {
            this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

            // 监听远程用户加入
            this.client.on("user-published", async (user, mediaType) => {
                await this.handleUserPublished(user, mediaType);
            });

            // 监听远程用户取消发布
            this.client.on("user-unpublished", async (user, mediaType) => {
                await this.handleUserUnpublished(user, mediaType);
            });

            // 监听远程用户离开
            this.client.on("user-left", (user) => {
                this.handleUserLeft(user);
            });

            console.log("[Agora] 客户端初始化成功");
            return true;
        } catch (error) {
            console.error("[Agora] 客户端初始化失败:", error);
            return false;
        }
    }

    async joinChannel(channelId, uid, userName) {
        try {
            this.userName = userName;
            // 加入频道
            await this.client.join(this.appId, channelId, this.token, uid || null);
            console.log("[Agora] 成功加入频道");

            // 创建本地音视频轨道
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

            // 发布本地轨道
            await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
            console.log("[Agora] 本地轨道发布成功");

            // 显示本地视频
            const localContainer = document.createElement("div");
            localContainer.id = "local-player";
            localContainer.className = "video-container";
            localContainer.setAttribute('data-user-name', this.userName); // 添加用户名属性
            document.getElementById("videoGrid").append(localContainer);

            // 创建视频元素容器
            const videoContainer = document.createElement("div");
            videoContainer.style.width = "100%";
            videoContainer.style.height = "100%";
            videoContainer.style.position = "absolute";
            videoContainer.style.overflow = "hidden";
            localContainer.appendChild(videoContainer);

            // 播放视频
            this.localVideoTrack.play(videoContainer);

            return true;
        } catch (error) {
            console.error("[Agora] 加入频道失败:", error);
            return false;
        }
    }

    async leaveChannel() {
        try {
            // 停止并释放本地音视频轨道
            if (this.localAudioTrack) {
                this.localAudioTrack.stop();
                this.localAudioTrack.close();
            }
            if (this.localVideoTrack) {
                this.localVideoTrack.stop();
                this.localVideoTrack.close();
            }
            if (this.screenTrack) {
                this.screenTrack.stop();
                this.screenTrack.close();
                this.screenTrack = null;
            }

            // 离开频道
            await this.client.leave();
            console.log("[Agora] 成功离开频道");
            return true;
        } catch (error) {
            console.error("[Agora] 离开频道失败:", error);
            return false;
        }
    }

    async handleUserPublished(user, mediaType) {
        try {
            await this.client.subscribe(user, mediaType);
            console.log("[Agora] 订阅远程用户成功:", user.uid, mediaType);

            if (mediaType === "video") {
                let remoteContainer = document.getElementById(`remote-player-${user.uid}`);

                // 如果容器不存在，创建新容器
                if (!remoteContainer) {
                    remoteContainer = document.createElement("div");
                    remoteContainer.id = `remote-player-${user.uid}`;
                    remoteContainer.className = "video-container";
                    // 使用用户的 uid 作为显示名称，实际应用中可能需要通过信令服务器传递真实用户名
                    remoteContainer.setAttribute('data-user-name', `用户 ${user.uid}`);
                    document.getElementById("videoGrid").append(remoteContainer);

                    // 创建视频元素容器
                    const videoContainer = document.createElement("div");
                    videoContainer.id = `video-${user.uid}`;
                    videoContainer.style.width = "100%";
                    videoContainer.style.height = "100%";
                    videoContainer.style.position = "absolute";
                    videoContainer.style.overflow = "hidden";
                    remoteContainer.appendChild(videoContainer);
                }

                // 播放远程视频
                user.videoTrack.play(`video-${user.uid}`);
            }
            if (mediaType === "audio") {
                user.audioTrack.play();
            }

            this.remoteUsers.set(user.uid, user);
            uiManager.updateParticipantCount(this.remoteUsers.size + 1);
        } catch (error) {
            console.error("[Agora] 订阅远程用户失败:", error);
        }
    }

    async handleUserUnpublished(user, mediaType) {
        try {
            console.log("[Agora] 用户取消发布:", user.uid, mediaType);

            if (mediaType === "video") {
                // 不删除容器，只清空视频内容
                const videoContainer = document.getElementById(`video-${user.uid}`);
                if (videoContainer) {
                    videoContainer.innerHTML = '';
                    // 添加一个提示信息
                    const placeholder = document.createElement("div");
                    placeholder.className = "video-placeholder";
                    placeholder.textContent = "视频已关闭";
                    videoContainer.appendChild(placeholder);
                }
            }
        } catch (error) {
            console.error("[Agora] 处理用户取消发布失败:", error);
        }
    }

    handleUserLeft(user) {
        console.log("[Agora] 远程用户离开:", user.uid);
        this.remoteUsers.delete(user.uid);
        uiManager.updateParticipantCount(this.remoteUsers.size + 1);

        // 移除远程用户的视频容器
        const remoteContainer = document.getElementById(`remote-player-${user.uid}`);
        if (remoteContainer) {
            remoteContainer.remove();
        }
    }

    async toggleAudio() {
        console.log('[Agora] 尝试切换音频状态');
        try {
            if (!this.localAudioTrack) {
                console.warn('[Agora] 音频轨道未初始化');
                return false;
            }

            const enabled = !this.localAudioTrack.enabled;
            await this.localAudioTrack.setEnabled(enabled);
            console.log(`[Agora] 音频已${enabled ? '启用' : '禁用'}`);
            return enabled;
        } catch (error) {
            console.error('[Agora] 切换音频状态失败:', error);
            return false;
        }
    }

    async toggleVideo() {
        console.log('[Agora] 尝试切换视频状态');
        try {
            if (!this.localVideoTrack) {
                console.warn('[Agora] 视频轨道未初始化');
                return false;
            }

            const enabled = !this.localVideoTrack.enabled;
            await this.localVideoTrack.setEnabled(enabled);
            console.log(`[Agora] 视频已${enabled ? '启用' : '禁用'}`);
            return enabled;
        } catch (error) {
            console.error('[Agora] 切换视频状态失败:', error);
            return false;
        }
    }

    async toggleScreenShare() {
        console.log('[Agora] 尝试切换屏幕共享状态');
        try {
            if (this.screenTrack) {
                console.log('[Agora] 正在停止屏幕共享');
                // 停止屏幕共享
                await this.client.unpublish(this.screenTrack);
                this.screenTrack.stop();
                this.screenTrack.close();
                this.screenTrack = null;

                // 重新发布视频轨道
                if (this.localVideoTrack) {
                    console.log('[Agora] 重新发布视频轨道');
                    await this.client.publish(this.localVideoTrack);
                    // 重新显示本地视频
                    const localContainer = document.getElementById('local-player');
                    if (localContainer) {
                        const videoContainer = localContainer.querySelector('div');
                        this.localVideoTrack.play(videoContainer);
                    }
                }
                console.log("[Agora] 屏幕共享已停止");
                return false;
            } else {
                console.log('[Agora] 正在启动屏幕共享');
                try {
                    // 创建屏幕共享轨道
                    this.screenTrack = await AgoraRTC.createScreenVideoTrack();
                } catch (error) {
                    console.error('[Agora] 创建屏幕共享轨道失败:', error);
                    if (error.message === 'Permission denied') {
                        alert('获取屏幕共享权限被拒绝');
                    }
                    return false;
                }

                // 取消发布视频轨道
                if (this.localVideoTrack) {
                    console.log('[Agora] 取消发布原视频轨道');
                    await this.client.unpublish(this.localVideoTrack);
                }

                // 发布屏幕共享轨道
                console.log('[Agora] 发布屏幕共享轨道');
                await this.client.publish(this.screenTrack);
                
                // 在本地视频容器中播放屏幕共享
                const localContainer = document.getElementById('local-player');
                if (localContainer) {
                    const videoContainer = localContainer.querySelector('div');
                    this.screenTrack.play(videoContainer);
                }
                
                console.log("[Agora] 屏幕共享已开始");

                // 监听屏幕共享结束
                this.screenTrack.on("track-ended", async () => {
                    console.log('[Agora] 检测到屏幕共享已结束');
                    await this.toggleScreenShare();
                });

                return true;
            }
        } catch (error) {
            console.error("[Agora] 切换屏幕共享失败:", error);
            return false;
        }
    }
}

// 创建并导出 AgoraManager 实例
const agoraManager = new AgoraManager();
export { agoraManager };
