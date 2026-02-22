// utils/request.js
// 后端接口基础域名（本地调试用，上线替换为服务器域名）
const baseUrl = 'http://localhost:8080/api';

/**
 * 通用请求封装
 * @param {String} url 接口路径（相对于baseUrl）
 * @param {String} method 请求方法 GET/POST/PUT/DELETE
 * @param {Object} data 请求参数
 * @returns {Promise} 返回Promise对象
 */
// utils/request.js
const request = (url, method = 'GET', data = {}) => {
  // 获取本地存储的token
  const token = wx.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${url}`,
      method: method,
      data: method === 'GET' ? data : JSON.stringify(data),
      // utils/request.js 的header部分
      header: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' // 已携带Token
          },
      success: (res) => {
        // 新增：后端返回token失效时的处理
        if (res.data.code === 401) { // 后端定义401为未授权/TOKEN失效
          wx.showToast({
            title: '登录已失效，请重新登录',
            icon: 'none'
          });
          wx.removeStorageSync('token'); // 清除无效token
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/index/index' });
          }, 1500);
          reject(res.data);
          return;
        }

        if (res.data.code === 200) {
          resolve(res.data);
        } else {
          wx.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none',
            duration: 2000
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络异常，请检查后端是否启动',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
};

// ========== 计划相关接口封装 ==========
const planApi = {
  /**
   * 查询指定日期+类型的计划
   * @param {String} date 日期（YYYY-MM-DD）
   * @param {String} type 计划类型：long_term/memo/urgent
   * @returns {Promise}
   */
  getPlan: (date, type) => {
    return request(`/plan/get?date=${date}&type=${type}`, 'GET');
  },

  /**
   * 保存计划（长期/备忘/紧急通用）
   * @param {Object} planData 计划数据
   * @returns {Promise}
   */
  savePlan: (planData) => {
    return request('/plan/save', 'POST', planData);
  },

  /**
   * 删除计划
   * @param {Number} planId 计划ID
   * @returns {Promise}
   */
  deletePlan: (planId) => {
    return request(`/plan/delete?id=${planId}`, 'GET');
  }
};

// utils/request.js 中补充用户接口
const userApi = {
  /**
   * 用户注册
   * @param {Object} data {username, password}
   * @returns {Promise}
   */
  register: (data) => {
    return request('/user/register', 'POST', data);
  },

  /**
   * 用户登录
   * @param {Object} data {username, password}
   * @returns {Promise}
   */
  login: (data) => {
    return request('/user/login', 'POST', data);
  }
};

// 导出时新增userApi
module.exports = {
  planApi,
  userApi
};