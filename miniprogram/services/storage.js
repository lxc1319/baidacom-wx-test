/**
 * 本地存储服务
 * 提供统一的本地存储接口
 */

const STORAGE_KEYS = {
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  SEARCH_HISTORY: 'search_history'
}

const storage = {
  /**
   * 设置存储值
   * @param {string} key 键名
   * @param {*} value 值
   * @returns {boolean} 是否成功
   */
  set(key, value) {
    try {
      wx.setStorageSync(key, value)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 获取存储值
   * @param {string} key 键名
   * @param {*} defaultValue 默认值
   * @returns {*} 存储值
   */
  get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key)
      return value !== undefined ? value : defaultValue
    } catch (error) {
      return defaultValue
    }
  },

  /**
   * 移除存储值
   * @param {string} key 键名
   * @returns {boolean} 是否成功
   */
  remove(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 清空所有存储
   * @returns {boolean} 是否成功
   */
  clear() {
    try {
      wx.clearStorageSync()
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 存储访问令牌
   * @param {string} accessToken 访问令牌
   * @param {string} refreshToken 刷新令牌
   * @returns {boolean} 是否成功
   */
  setToken(accessToken, refreshToken) {
    try {
      wx.setStorageSync(STORAGE_KEYS.TOKEN, accessToken)
      if (refreshToken) {
        wx.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      }
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 获取访问令牌
   * @returns {string|null} 访问令牌
   */
  getToken() {
    try {
      return wx.getStorageSync(STORAGE_KEYS.TOKEN)
    } catch (error) {
      return null
    }
  },

  /**
   * 获取刷新令牌
   * @returns {string|null} 刷新令牌
   */
  getRefreshToken() {
    try {
      return wx.getStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
    } catch (error) {
      return null
    }
  },

  /**
   * 清除认证信息
   * @returns {boolean} 是否成功
   */
  clearAuth() {
    try {
      wx.removeStorageSync(STORAGE_KEYS.TOKEN)
      wx.removeStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
      wx.removeStorageSync(STORAGE_KEYS.USER_INFO)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 存储用户信息
   * @param {Object} userInfo 用户信息
   * @returns {boolean} 是否成功
   */
  setUserInfo(userInfo) {
    return this.set(STORAGE_KEYS.USER_INFO, userInfo)
  },

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  getUserInfo() {
    return this.get(STORAGE_KEYS.USER_INFO)
  },

  /**
   * 添加搜索历史
   * @param {string} keyword 搜索关键词
   * @returns {boolean} 是否成功
   */
  addSearchHistory(keyword) {
    try {
      let history = this.get(STORAGE_KEYS.SEARCH_HISTORY, [])
      // 去重并移到最前面
      history = history.filter(item => item !== keyword)
      history.unshift(keyword)
      // 最多保留10条
      history = history.slice(0, 10)
      return this.set(STORAGE_KEYS.SEARCH_HISTORY, history)
    } catch (error) {
      return false
    }
  },

  /**
   * 获取搜索历史
   * @returns {Array} 搜索历史列表
   */
  getSearchHistory() {
    return this.get(STORAGE_KEYS.SEARCH_HISTORY, [])
  },

  /**
   * 清除搜索历史
   * @returns {boolean} 是否成功
   */
  clearSearchHistory() {
    return this.remove(STORAGE_KEYS.SEARCH_HISTORY)
  }
}

module.exports = storage
