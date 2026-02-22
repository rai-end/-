// pages/login/login.js
const { userApi } = require('../../utils/request.js');

Page({
  data: {
    username: '',  // 用户名
    password: ''   // 密码
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({ username: e.detail.value.trim() });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({ password: e.detail.value.trim() });
  },

  // 执行登录
  doLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      return wx.showToast({ title: '用户名/密码不能为空', icon: 'none' });
    }
  
    // 显示加载中（配对第一步）
    wx.showLoading({ title: '登录中...' });
    
    userApi.login({ username, password })
      .then(res => {
        // 隐藏加载中（配对第二步：成功时）
        wx.hideLoading();
        if (res.code === 200) {
          // 保存Token
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('userInfo', res.data.user);
          // 跳转到tabBar页面
          wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
          wx.switchTab({ url: '/pages/main/main' });
        } else {
          wx.showToast({ title: res.msg || '登录失败', icon: 'none' });
        }
      })
      .catch(err => {
        // 隐藏加载中（配对第二步：失败时）
        wx.hideLoading();
        console.error('登录失败：',msg);
        wx.showToast({ title: '登录失败：接口访问异常', icon: 'none' });
      });
  }
});