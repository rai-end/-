// pages/main/main.js
// 引入封装的计划接口
const { planApi } = require('../../utils/request.js');

Page({
  data: {
    selectedDate: '',        // 选中的日期
    // 长期计划数据
    longTermPlan: {
      content: '',           // 计划内容
      planType: 'long_term'  // 对应后端的plan_type
    },
    // 备忘计划数据
    memoPlan: {
      content: '',           // 计划内容
      planType: 'memo'       // 对应后端的plan_type
    },
    // 紧急计划数据
    urgentPlan: {
      content: '',           // 计划内容
      remindTime: '',        // 提醒时间（HH:MM），对应后端的remind_time
      planType: 'urgent'     // 对应后端的plan_type
    },
    remindTimer: null,       // 提醒定时器
    // 存储已保存计划的ID（用于删除）
    planIdMap: {
      longTerm: '',
      memo: '',
      urgent: ''
    }
  },

  // 页面加载：先校验登录态 → 再初始化日期+加载数据
  onLoad(options) {
    // ========== 核心新增：登录态校验 ==========
    const token = wx.getStorageSync('token'); // 获取登录时存储的token
    if (!token) {
      // 未登录：提示并跳转回登录入口页（index）
      wx.showToast({ 
        title: '请先登录账号', 
        icon: 'none',
        duration: 2000
      });
      // 延迟跳转，确保提示语能显示
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index' // 跳转到首页（注册/登录入口）
        });
      }, 1500);
      // 终止后续逻辑执行
      return;
    }

    // 已登录：继续原有初始化逻辑
    // 初始化今日日期
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.setData({
      selectedDate: `${year}-${month}-${day}`
    });
    // 加载后端计划数据
    this.loadPlansFromBackend();
  },
  
  // 页面卸载：清除定时器
  onUnload() {
    if (this.data.remindTimer) {
      clearInterval(this.data.remindTimer);
    }
  },

  // ========== 新增：页面显示时再次校验登录态（防止token失效） ==========
  onShow() {
    const token = wx.getStorageSync('token');
    if (!token && this.data.selectedDate) { // 已进入页面但token失效
      wx.showToast({
        title: '登录已失效，请重新登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }, 1500);
    }
  },

  // 日期选择变更
  onDateChange(e) {
    const newDate = e.detail.value;
    this.setData({ 
      selectedDate: newDate,
      // 清空当前输入框
      memoPlan: { content: '', planType: 'memo' },
      urgentPlan: { content: '', remindTime: '', planType: 'urgent' }
    });
    // 加载新日期的计划数据
    this.loadPlansFromBackend();
  },

  // ========== 通用方法：从后端加载计划数据（新增token携带） ==========
  loadPlansFromBackend() {
    const { selectedDate } = this.data;
    wx.showLoading({ title: '加载中...' });

    // 1. 加载长期计划
    planApi.getPlan(selectedDate, 'long_term')
      .then(res => {
        if (res.data && res.data.length > 0) {
          const plan = res.data[0];
          this.setData({
            'longTermPlan.content': plan.content,
            'planIdMap.longTerm': plan.id
          });
        } else {
          this.setData({
            'longTermPlan.content': '',
            'planIdMap.longTerm': ''
          });
        }
      })
      .catch(err => console.error('加载长期计划失败：', err))
      .finally(() => {
        // 2. 加载备忘计划
        planApi.getPlan(selectedDate, 'memo')
          .then(res => {
            if (res.data && res.data.length > 0) {
              const plan = res.data[0];
              this.setData({
                'memoPlan.content': plan.content,
                'planIdMap.memo': plan.id
              });
            } else {
              this.setData({
                'memoPlan.content': '',
                'planIdMap.memo': ''
              });
            }
          })
          .catch(err => console.error('加载备忘计划失败：', err))
          .finally(() => {
            // 3. 加载紧急计划
            planApi.getPlan(selectedDate, 'urgent')
              .then(res => {
                if (res.data && res.data.length > 0) {
                  const plan = res.data[0];
                  this.setData({
                    'urgentPlan.content': plan.content,
                    'urgentPlan.remindTime': plan.remindTime,
                    'planIdMap.urgent': plan.id
                  });
                  // 重新开启提醒
                  this.startUrgentRemind({
                    date: selectedDate,
                    time: plan.remindTime,
                    content: plan.content
                  });
                } else {
                  this.setData({
                    'urgentPlan.content': '',
                    'urgentPlan.remindTime': '',
                    'planIdMap.urgent': ''
                  });
                }
              })
              .catch(err => console.error('加载紧急计划失败：', err))
              .finally(() => {
                wx.hideLoading();
              });
          });
      });
  },

  // ========== 长期计划模块 ==========
  onLongTermInput(e) {
    this.setData({ 'longTermPlan.content': e.detail.value });
  },

  // 保存长期计划（调用后端接口）
  saveLongTermPlan() {
    const { selectedDate, longTermPlan } = this.data;
    if (!longTermPlan.content) {
      return wx.showToast({ title: '请输入长期计划内容', icon: 'none' });
    }

    // 组装后端需要的参数
    const planData = {
      planDateStr: selectedDate,
      content: longTermPlan.content,
      planType: longTermPlan.planType
    };

    wx.showLoading({ title: '保存中...' });
    planApi.savePlan(planData)
      .then(res => {
        wx.showToast({ title: '长期计划保存成功' });
        // 重新加载数据（获取后端返回的计划ID）
        this.loadPlansFromBackend();
      })
      .catch(err => {
        console.error('保存长期计划失败：', err);
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 删除长期计划（调用后端接口）
  deleteLongTermPlan() {
    const { planIdMap } = this.data;
    if (!planIdMap.longTerm) {
      return wx.showToast({ title: '暂无可删除的长期计划', icon: 'none' });
    }

    wx.showModal({
      title: '确认删除',
      content: '是否删除该长期计划？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          planApi.deletePlan(planIdMap.longTerm)
            .then(() => {
              wx.showToast({ title: '长期计划已删除' });
              // 清空输入框 + 重新加载数据
              this.setData({ 'longTermPlan.content': '' });
              this.loadPlansFromBackend();
            })
            .catch(err => {
              console.error('删除长期计划失败：', err);
            })
            .finally(() => {
              wx.hideLoading();
            });
        }
      }
    });
  },

  // ========== 备忘计划模块 ==========
  onMemoInput(e) {
    this.setData({ 'memoPlan.content': e.detail.value });
  },

  // 保存备忘计划（调用后端接口）
  saveMemoPlan() {
    const { selectedDate, memoPlan } = this.data;
    if (!memoPlan.content) {
      return wx.showToast({ title: '请输入备忘计划内容', icon: 'none' });
    }

    const planData = {
      planDateStr: selectedDate,
      content: memoPlan.content,
      planType: memoPlan.planType
    };

    wx.showLoading({ title: '保存中...' });
    planApi.savePlan(planData)
      .then(res => {
        wx.showToast({ title: '备忘计划保存成功' });
        this.loadPlansFromBackend();
      })
      .catch(err => {
        console.error('保存备忘计划失败：', err);
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 删除备忘计划（调用后端接口）
  deleteMemoPlan() {
    const { planIdMap } = this.data;
    if (!planIdMap.memo) {
      return wx.showToast({ title: '暂无可删除的备忘计划', icon: 'none' });
    }

    wx.showModal({
      title: '确认删除',
      content: '是否删除该备忘计划？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          planApi.deletePlan(planIdMap.memo)
            .then(() => {
              wx.showToast({ title: '备忘计划已删除' });
              this.setData({ 'memoPlan.content': '' });
              this.loadPlansFromBackend();
            })
            .catch(err => {
              console.error('删除备忘计划失败：', err);
            })
            .finally(() => {
              wx.hideLoading();
            });
        }
      }
    });
  },

  // ========== 紧急计划模块 ==========
  onUrgentInput(e) {
    this.setData({ 'urgentPlan.content': e.detail.value });
  },

  onUrgentTimeChange(e) {
    this.setData({ 'urgentPlan.remindTime': e.detail.value });
  },

  // 保存紧急计划（调用后端接口 + 开启提醒）
  saveUrgentPlan() {
    const { selectedDate, urgentPlan } = this.data;
    if (!urgentPlan.content) {
      return wx.showToast({ title: '请输入紧急计划内容', icon: 'none' });
    }
    if (!urgentPlan.remindTime) {
      return wx.showToast({ title: '请选择提醒时间', icon: 'none' });
    }

    const planData = {
      planDateStr: selectedDate,
      content: urgentPlan.content,
      planType: urgentPlan.planType,
      remindTime: urgentPlan.remindTime
    };

    wx.showLoading({ title: '保存中...' });
    planApi.savePlan(planData)
      .then(res => {
        wx.showToast({ title: '紧急计划保存成功，已开启提醒' });
        // 重新加载数据 + 开启提醒
        this.loadPlansFromBackend();
        this.startUrgentRemind({
          date: selectedDate,
          time: urgentPlan.remindTime,
          content: urgentPlan.content
        });
      })
      .catch(err => {
        console.error('保存紧急计划失败：', err);
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 紧急计划提醒逻辑（前端保留）
  startUrgentRemind(urgentData) {
    if (this.data.remindTimer) {
      clearInterval(this.data.remindTimer);
    }

    const timer = setInterval(() => {
      const now = new Date();
      const nowDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (nowDate === urgentData.date && nowTime === urgentData.time) {
        wx.showModal({
          title: '紧急提醒',
          content: `🚨 ${urgentData.content}`,
          showCancel: false,
          confirmText: '已完成'
        });
        clearInterval(timer);
      }
    }, 1000);

    this.setData({ remindTimer: timer });
  },

  // ========== 新增：退出登录功能（可选，建议添加） ==========
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '是否退出当前账号？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录态
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          // 清除定时器
          if (this.data.remindTimer) {
            clearInterval(this.data.remindTimer);
          }
          // 跳转回首页
          wx.redirectTo({
            url: '/pages/index/index'
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});