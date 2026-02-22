Page({
  data: {
    userInfo: {} // 用户信息
  },

  // 页面加载时获取本地存储的用户信息
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '是否确定退出登录？',
      success: (res) => {
        if (res.confirm) {
          // 1. 清除本地存储的用户信息和Token
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          // 2. 跳转到index页面（注册/登录页）
          wx.reLaunch({
            url: '/pages/index/index' // 替换为你的index页面路径
          });
          // 3. 提示退出成功
          wx.showToast({
            title: '退出成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});