/**
 * 认证服务
 * 提供用户认证相关功能，包括微信登录、Token 管理、登出等
 */

const request = require('../utils/request.js')
const storage = require('./storage.js')

/**
 * 认证服务类
 */
class AuthService {
  constructor() {
    // 是否正在刷新 Token
    this.isRefreshing = false
    // 存储微信登录返回的 openId，用于后续注册
    this.openId = null
  }

  /**
   * 微信小程序登录（参考 baidacom-wx-1 实现）n   * 1. 先调用 wxLogin 获取 openId
   * 2. 如果已注册，返回 userId 和 token
   * 3. 如果未注册，只返回 openId，需要后续获取手机号注册
   * @param {boolean} silent 是否静默登录（不显示错误提示）
   * @returns {Promise<Object>} 登录结果 { success: boolean, needPhone: boolean, openId: string }
   */
   async weixinLogin(silent = false) {
    try {
      // 1. 调用微信登录接口获取 code
      const loginRes = await this.getWeixinCode()
      
      if (!loginRes.code) {
        throw new Error('获取微信登录凭证失败')
      }

      // 2. 将 code 发送到后端进行验证
      const result = await request.post('/client/auth/wxLogin', {
        code: loginRes.code
      }, {
        needAuth: false
      })

      // 3. 存储 openId（用于后续注册）
      this.openId = result.openId || null

      // 4. 判断是否需要手机号授权
      // 如果返回了 userId，说明已注册，直接登录成功
      // 如果没有返回 userId，说明未注册，需要获取手机号
      if (result.userId) {
        // 已注册，存储 Token 和用户信息
        await storage.setToken(result.accessToken, result.refreshToken)
        if (result.userInfo) {
          await storage.setUserInfo(result.userInfo)
        }
        return { success: true, needPhone: false, openId: this.openId }
      } else {
        // 未注册，需要获取手机号
        return { success: false, needPhone: true, openId: this.openId }
      }
    } catch (error) {
      console.error('[Auth] 微信登录失败:', error)
      
      if (!silent) {
        wx.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      }
      return { success: false, needPhone: false, openId: null }
    }
  }

  /**
   * 微信手机号注册（参考 baidacom-wx-1 实现）
   * 使用 openId 和手机号授权码完成注册
   * @param {string} phoneCode 手机号授权码
   * @returns {Promise<boolean>} 注册是否成功
   */
  async wxRegisterByCode(phoneCode) {
    try {
      if (!this.openId) {
        throw new Error('获取微信信息失败，请重新登录')
      }

      if (!phoneCode) {
        throw new Error('获取手机号失败')
      }

      const result = await request.post('/client/auth/wxRegisterByCode', {
        openid: this.openId,
        code: phoneCode
      }, {
        needAuth: false
      })

      // 注册成功，存储 Token 和用户信息
      if (result.userId) {
        await storage.setToken(result.accessToken, result.refreshToken)
        if (result.userInfo) {
          await storage.setUserInfo(result.userInfo)
        }
        return true
      } else {
        throw new Error('注册失败')
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 获取微信登录 code
   * @returns {Promise<Object>} 登录结果
   */
  getWeixinCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  }

  /**
   * 刷新 Token
   * @returns {Promise<boolean>} 刷新是否成功
   */
  async refreshToken() {
    if (this.isRefreshing) {
      return false
    }

    this.isRefreshing = true

    try {
      const refreshToken = storage.getRefreshToken()
      if (!refreshToken) {
        throw new Error('没有刷新令牌')
      }

      const result = await request.post('/client/auth/refresh-token', {
        refreshToken
      }, {
        needAuth: false
      })

      await storage.setToken(result.accessToken, result.refreshToken)
      return true
    } catch (error) {
      return false
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 登出
   */
  async logout() {
    try {
      await request.post('/client/auth/logout', {}, { needAuth: true })
    } catch (error) {
      // 忽略登出接口的错误
    } finally {
      await storage.clearAuth()
      this.openId = null
    }
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return !!storage.getToken()
  }

  /**
   * 获取存储的 openId
   * @returns {string|null} openId
   */
  getOpenId() {
    return this.openId
  }
}

// 创建认证服务实例
const authService = new AuthService()

module.exports = authService
