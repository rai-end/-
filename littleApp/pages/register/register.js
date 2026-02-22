// pages/register/register.js
const { userApi } = require('../../utils/request.js'); // 后续封装用户接口

Page({
  data: {
    username: '',    // 用户名
    password: '',    // 密码
    confirmPwd: ''   // 确认密码
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({ username: e.detail.value.trim() });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({ password: e.detail.value.trim() });
  },

  // 输入确认密码
  onConfirmPwdInput(e) {
    this.setData({ confirmPwd: e.detail.value.trim() });
  },

  // 执行注册
  doRegister() {
    const { username, password, confirmPwd } = this.data;
    
    // 前端校验
    if (!username) {
      return wx.showToast({ title: '请输入用户名', icon: 'none' });
    }
    if (!password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' });
    }
    if (password.length < 6) {
      return wx.showToast({ title: '密码长度不少于6位', icon: 'none' });
    }
    if (password !== confirmPwd) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' });
    }

    // 调用注册接口
    wx.showLoading({ title: '注册中...' });
    userApi.register({ username, password })
      .then(res => {
        wx.hideLoading();
        wx.showToast({ title: '注册成功', icon: 'success' });
        // 注册成功后返回首页
        setTimeout(() => {
          wx.navigateBack({
            delta: 1  // 返回上一级（index页面）
          });
        }, 1500);
      })
      .catch(err => {
        wx.hideLoading();
        console.error('注册失败：', err);
      });
  }
});