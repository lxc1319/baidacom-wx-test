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
   * 微信小程序登录（参考 baidacom-wx-1 实现）
   * 1. 调用 wx.getUserInfo 获取用户信息
   * 2. 调用 wx.login 获取 code
   * 3. 调用 wxLogin 获取 openId
   * 4. 如果已注册，返回 userId 和 token
   * 5. 如果未注册，只返回 openId，需要后续获取手机号注册
   * @param {boolean} silent 是否静默登录（不显示错误提示）
   * @returns {Promise<Object>} 登录结果 { success: boolean, needPhone: boolean, openId: string }
   */
  async weixinLogin(silent = false) {
    return new Promise((resolve, reject) => {
      // 1. 先获取用户信息（昵称、头像）
      wx.getUserInfo({
        success: (userRes) => {
          const userProfile = userRes.userInfo
          console.log('[Auth] 获取用户信息:', userProfile)

          // 2. 获取 code（必须在获取用户信息后立即获取，避免过期）
          wx.login({
            success: async (loginRes) => {
              if (!loginRes.code) {
                if (!silent) {
                  wx.showToast({
                    title: '获取微信登录凭证失败',
                    icon: 'none'
                  })
                }
                resolve({ success: false, needPhone: false, openId: null })
                return
              }

              try {
                // 3. 将 code 和用户信息发送到后端进行验证
                // 清理头像URL中的多余字符
                let avatarUrl = userProfile.avatarUrl || ''
                if (avatarUrl) {
                  avatarUrl = avatarUrl.replace(/[`]/g, '').trim()
                }
                
                const result = await request.post('/client/auth/wxLogin', {
                  code: loginRes.code,
                  nickname: userProfile.nickName || '',
                  avatar: avatarUrl
                }, {
                  needAuth: false
                })

                // 4. 存储 openId（用于后续注册）
                this.openId = result.openId || null

                // 5. 判断是否需要手机号授权
                // 如果返回了 userId，说明已注册，直接登录成功
                // 如果没有返回 userId，说明未注册，需要获取手机号
                if (result.userId) {
                  // 已注册，存储 Token 和用户信息
                  await storage.setToken(result.accessToken, result.refreshToken)
                  if (result.userInfo) {
                    await storage.setUserInfo(result.userInfo)
                  }
                  resolve({ success: true, needPhone: false, openId: this.openId })
                } else {
                  // 未注册，需要获取手机号
                  resolve({ success: false, needPhone: true, openId: this.openId })
                }
              } catch (error) {
                console.error('[Auth] 微信登录失败:', error)

                if (!silent) {
                  wx.showToast({
                    title: error.message || '登录失败',
                    icon: 'none'
                  })
                }
                resolve({ success: false, needPhone: false, openId: null })
              }
            },
            fail: (err) => {
              console.error('[Auth] 获取微信登录凭证失败:', err)
              if (!silent) {
                wx.showToast({
                  title: '获取微信登录凭证失败',
                  icon: 'none'
                })
              }
              resolve({ success: false, needPhone: false, openId: null })
            }
          })
        },
        fail: (err) => {
          console.error('[Auth] 获取用户信息失败:', err)
          if (!silent) {
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            })
          }
          resolve({ success: false, needPhone: false, openId: null })
        }
      })
    })
  }

  /**
   * 微信登录接口（参考 baidacom-wx-1 实现）
   * 调用后端 /client/auth/wxLogin 接口
   * @param {Object} data 登录参数 { code, nickname, avatar }
   * @returns {Promise<Object>} 登录结果
   */
  async wxLogin(data) {
    console.log('[Auth] wxLogin 请求:', data);
    try {
      const result = await request.post('/client/auth/wxLogin', {
        code: data.code,
        nickname: data.nickname,
        avatar: data.avatar
      }, {
        needAuth: false,
        showLoading: false,
        header: {
          'tenant-id': '1'
        }
      });
      
      console.log('[Auth] wxLogin 响应:', result);
      
      // 存储 openId
      if (result.openId) {
        this.openId = result.openId;
      }
      
      return result;
    } catch (error) {
      console.error('[Auth] wxLogin 失败:', error);
      throw error;
    }
  }

  /**
   * 缓存用户信息（参考 baidacom-wx-1 实现）
   * @param {Object} data 用户数据
   */
  async setUserInfo(data) {
    console.log('[Auth] setUserInfo:', data);
    
    if (data.accessToken) {
      await storage.setToken(data.accessToken, data.refreshToken);
    }
    
    if (data.userInfo) {
      await storage.setUserInfo(data.userInfo);
    }
    
    // 存储租户ID
    if (data.tenantId) {
      wx.setStorageSync('tenantId', data.tenantId + '');
    }
  }

  /**
   * 获取微信用户信息
   * @returns {Promise<Object>} 用户信息
   */
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo)
        },
        fail: (err) => {
          console.error('[Auth] 获取用户信息失败:', err)
          // 获取失败返回空对象，不影响登录
          resolve({})
        }
      })
    })
  }

  /**
   * 微信手机号注册（参考 baidacom-wx-1 实现）
   * 使用 openId 和手机号授权码完成注册
   * @param {string} phoneCode 手机号授权码
   * @param {string} nickname 用户昵称
   * @param {string} avatar 用户头像
   * @returns {Promise<Object>} 注册结果
   */
  async wxRegisterByCode(phoneCode, nickname = '', avatar = '') {
    try {
      if (!this.openId) {
        throw new Error('获取微信信息失败，请重新登录')
      }

      if (!phoneCode) {
        throw new Error('获取手机号失败')
      }

      const result = await request.post('/client/auth/wxRegisterByCode', {
        openid: this.openId,
        code: phoneCode,
        nickname: nickname,
        avatar: avatar
      }, {
        needAuth: false,
        header: {
          'tenant-id': '1'
        }
      })

      // 注册成功，存储 Token 和用户信息
      if (result.userId) {
        await storage.setToken(result.accessToken, result.refreshToken)
        if (result.userInfo) {
          await storage.setUserInfo(result.userInfo)
        }
      }
      
      return result
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
