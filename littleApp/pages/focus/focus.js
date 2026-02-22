Page({
  data: {
    totalSeconds: 25 * 60, // 默认25分钟（秒数）
    remainingSeconds: 25 * 60, // 剩余秒数
    formatTime: '25:00', // 格式化显示的时间
    isRunning: false, // 是否正在计时
    isPaused: false, // 是否暂停
    timer: null, // 定时器
    customTime: '' // 自定义输入的分钟数（新增）
  },

  // 页面卸载时强制清除定时器（防止内存泄漏）
  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
  },

  // 页面隐藏时暂停计时（切后台也暂停）
  onHide() {
    if (this.data.isRunning && !this.data.isPaused) {
      this.pauseCountdown();
    }
  },

  // 格式化秒数为 mm:ss（核心工具方法，确保无错）
  formatSeconds(seconds) {
    // 容错：防止seconds为NaN/负数
    if (!seconds || seconds < 0) seconds = 0;
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  },

  // 设置预设专注时间（分钟）
  setTime(e) {
    if (this.data.isRunning) return; // 计时中不可修改
    const minutes = parseInt(e.currentTarget.dataset.time);
    if (!minutes || minutes < 1) return; // 容错
    const seconds = minutes * 60;
    this.setData({
      totalSeconds: seconds,
      remainingSeconds: seconds,
      formatTime: this.formatSeconds(seconds),
      customTime: '' // 清空自定义输入框
    });
  },

  // 新增：监听自定义时间输入（修复空值/空格问题）
  inputCustomTime(e) {
    // 只保留数字，过滤其他字符
    const value = (e.detail.value || '').replace(/\D/g, '').trim();
    this.setData({
      customTime: value
    });
  },

  // 新增：确认自定义时间（完整容错）
  confirmCustomTime() {
    if (this.data.isRunning) {
      wx.showToast({ title: '计时中无法修改时间', icon: 'none' });
      return;
    }
    // 校验输入：必须是数字，且≥1分钟
    const minutes = parseInt(this.data.customTime);
    if (!minutes || minutes < 1) {
      wx.showToast({
        title: '请输入≥1的有效数字',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 限制最大时间（可选，比如不超过120分钟）
    if (minutes > 120) {
      wx.showToast({
        title: '最多支持120分钟',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 更新时间
    const seconds = minutes * 60;
    this.setData({
      totalSeconds: seconds,
      remainingSeconds: seconds,
      formatTime: this.formatSeconds(seconds),
      customTime: '' // 清空输入框
    });
  },

  // 开始倒计时（核心逻辑，修复定时器重复创建）
  startCountdown() {
    if (this.data.isRunning && !this.data.isPaused) return; // 已在运行，不重复创建

    // 如果是暂停后继续，直接重启定时器；否则重置剩余时间
    if (this.data.isPaused) {
      this.setData({ isPaused: false });
    } else {
      this.setData({
        remainingSeconds: this.data.totalSeconds,
        formatTime: this.formatSeconds(this.data.totalSeconds)
      });
    }

    // 先清除旧定时器，防止多个定时器同时运行
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }

    // 启动新定时器
    this.setData({ isRunning: true });
    const timer = setInterval(() => {
      const { remainingSeconds } = this.data;
      // 计时结束
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        this.setData({
          isRunning: false,
          timer: null
        });
        // 提醒用户（震动+弹窗，替代音频避免路径问题）
        wx.vibrateLong();
        wx.showModal({
          title: '专注完成',
          content: '恭喜！你的专注时间已结束',
          showCancel: false,
          confirmText: '确定'
        });
        return;
      }
      // 剩余时间减1
      const newRemaining = remainingSeconds - 1;
      this.setData({
        remainingSeconds: newRemaining,
        formatTime: this.formatSeconds(newRemaining)
      });
    }, 1000);
    this.setData({ timer }); // 保存定时器引用
  },

  // 暂停倒计时
  pauseCountdown() {
    if (!this.data.isRunning || this.data.isPaused) return;
    clearInterval(this.data.timer);
    this.setData({
      isPaused: true
    });
  },

  // 继续倒计时（复用startCountdown逻辑）
  resumeCountdown() {
    if (!this.data.isRunning || !this.data.isPaused) return;
    this.startCountdown();
  },

  // 重置倒计时（完全恢复初始状态）
  resetCountdown() {
    // 清除定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
    // 重置数据
    this.setData({
      remainingSeconds: this.data.totalSeconds,
      formatTime: this.formatSeconds(this.data.totalSeconds),
      isRunning: false,
      isPaused: false,
      customTime: '' // 清空自定义输入
    });
  }
});