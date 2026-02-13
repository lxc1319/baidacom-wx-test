/**
 * 网络请求封装
 * 提供统一的网络请求接口，支持请求拦截、响应拦截、Token 自动刷新、缓存等功能
 */

const config = require('../config/api-config.js')
const tenantConfig = require('../config/tenant-config.js')
const storage = require('../services/storage.js')
const loading = require('./loading.js')
const cache = require('./cache.js')

/**
 * 请求类
 */
class Request {
  constructor() {
    // API 基础地址
    this.baseURL = config.getBaseURL()
    // 请求超时时间
    this.timeout = config.REQUEST_TIMEOUT
    // 请求重试次数
    this.retryCount = config.REQUEST_RETRY_COUNT
    // 是否正在刷新 Token
    this.isRefreshing = false
    // 刷新 Token 期间的请求队列
    this.requestQueue = []
  }

  /**
   * 发起网络请求
   * @param {Object} options 请求配置
   * @param {string} options.url 请求路径
   * @param {string} options.method 请求方法（GET/POST/PUT/DELETE）
   * @param {Object} options.data 请求数据
   * @param {Object} options.header 请求头
   * @param {boolean} options.needAuth 是否需要认证（默认 true）
   * @param {boolean} options.showLoading 是否显示加载提示（默认 true）
   * @param {string} options.loadingText 加载提示文字（默认"加载中..."）
   * @param {number} options.retryCount 重试次数（默认使用全局配置）
   * @param {boolean} options.useCache 是否使用缓存（默认 false）
   * @param {boolean} options.cacheOnly 是否仅使用缓存（默认 false）
   * @param {number} options.cacheExpireTime 自定义缓存过期时间（毫秒）
   * @returns {Promise} 请求结果
   */
  async request(options) {
    const { url, method = 'GET', data = {}, useCache = false, cacheOnly = false, needAuth = true } = options
    
    // 如果启用缓存，先尝试从缓存获取
    if (useCache && method.toUpperCase() === 'GET') {
      const cachedData = cache.getCache(url, data)
      
      if (cachedData !== null) {
        return cachedData
      }
      
      // 如果设置了仅使用缓存，且缓存不存在，则返回null
      if (cacheOnly) {
        return null
      }
    }
    
    // 显示加载提示
    if (options.showLoading !== false) {
      loading.show({
        title: options.loadingText || '加载中...'
      })
    }
    
    try {
      // 构建完整的请求配置
      const requestConfig = await this.buildRequestConfig(options)
      
      // 将 needAuth 传递给 doRequest，以便在处理响应时使用
      requestConfig.needAuth = needAuth
      
      // 发起请求
      const result = await this.doRequest(requestConfig, options.retryCount || this.retryCount)
      
      // 如果启用缓存，将结果存入缓存
      if (useCache && method.toUpperCase() === 'GET') {
        cache.setCache(url, data, result, {
          expireTime: options.cacheExpireTime
        })
      }
      
      // 隐藏加载提示
      if (options.showLoading !== false) {
        loading.hide()
      }
      
      return result
    } catch (error) {
      // 隐藏加载提示
      if (options.showLoading !== false) {
        loading.hide()
      }
      
      throw error
    }
  }

  /**
   * 构建请求配置
   * @param {Object} options 原始请求配置
   * @returns {Promise<Object>} 完整的请求配置
   */
  async buildRequestConfig(options) {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      needAuth = true
    } = options

    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    }

    // 如果需要认证，添加 Token
    if (needAuth) {
      const token = storage.getToken()
      if (token) {
        requestHeader.Authorization = `Bearer ${token}`
      }
    }

    // 添加租户ID - 后端期望的请求头名称为 "tenant-id"
    const tenantId = tenantConfig.getTenantId()
    if (tenantId) {
      requestHeader['tenant-id'] = tenantId
    }

    // 构建完整 URL
    const fullURL = this.buildFullURL(url)

    return {
      url: fullURL,
      method: method.toUpperCase(),
      data: method.toUpperCase() === 'GET' ? data : JSON.stringify(data),
      header: requestHeader,
      timeout: this.timeout
    }
  }

  /**
   * 构建完整 URL
   * @param {string} url 请求路径
   * @returns {string} 完整 URL
   */
  buildFullURL(url) {
    // 如果已经是完整 URL，直接返回
    if (url.startsWith('http')) {
      return url
    }
    
    // 拼接基础地址和路径
    const baseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    const path = url.startsWith('/') ? url : `/${url}`
    
    return `${baseURL}${path}`
  }

  /**
   * 执行请求
   * @param {Object} config 请求配置
   * @param {number} retryCount 剩余重试次数
   * @returns {Promise} 请求结果
   */
  doRequest(config, retryCount) {
    // 打印请求日志
    const fullUrl = config.url + (config.data && Object.keys(config.data).length > 0 ? '?' + Object.keys(config.data).map(k => `${k}=${encodeURIComponent(config.data[k])}`).join('&') : '')
    console.log(`[请求] ${config.method} ${fullUrl}`)
    console.log(`[请求参数]`, config.data)
    
    return new Promise((resolve, reject) => {
      wx.request({
        ...config,
        success: (res) => {
          // 打印响应日志
          console.log(`[响应] ${config.method} ${config.url} - ${res.statusCode}`, res.data)
          // 如果返回错误，打印详细错误信息
          if (res.data && res.data.code !== 0 && res.data.code !== 200) {
            console.error(`[响应错误] 接口: ${config.url}, 错误码: ${res.data.code}, 错误信息: ${res.data.message || res.data.msg}`)
          }
          this.handleResponse(res, config, retryCount)
            .then(resolve)
            .catch(reject)
        },
        fail: (error) => {
          // 打印错误日志
          console.error(`[请求失败] ${config.method} ${config.url}`, error)
          // 网络错误处理
          if (retryCount > 0) {
            // 重试请求
            this.doRequest(config, retryCount - 1)
              .then(resolve)
              .catch(reject)
          } else {
            reject(this.handleNetworkError(error))
          }
        }
      })
    })
  }

  /**
   * 处理响应
   * @param {Object} res 响应对象
   * @param {Object} config 请求配置
   * @param {number} retryCount 剩余重试次数
   * @returns {Promise} 处理后的数据
   */
  async handleResponse(res, config, retryCount) {
    const { statusCode, data } = res
    const needAuth = config.needAuth !== false

    // HTTP 状态码处理
    switch (statusCode) {
      case 200:
        // 请求成功
        return this.handleSuccess(data, needAuth, config)
      
      case 401:
        // Token 过期，只有需要认证的请求才尝试刷新
        if (needAuth) {
          return this.handleTokenExpired(config, retryCount)
        } else {
          // 不需要认证的请求返回 401，直接返回错误
          wx.showToast({
            title: '请求失败，请稍后重试',
            icon: 'none'
          })
          throw this.createError('请求失败，请稍后重试', 401)
        }
      
      case 403:
        // 权限不足
        wx.showToast({
          title: '权限不足',
          icon: 'none'
        })
        throw this.createError('权限不足', 403)
      
      case 404:
        // 资源不存在
        wx.showToast({
          title: '请求的资源不存在',
          icon: 'none'
        })
        throw this.createError('请求的资源不存在', 404)
      
      case 500:
      case 502:
      case 503:
      case 504:
        // 服务器错误
        wx.showToast({
          title: '服务器繁忙，请稍后重试',
          icon: 'none'
        })
        throw this.createError('服务器繁忙，请稍后重试', statusCode)
      
      default:
        // 其他错误
        wx.showToast({
          title: '请求失败，请稍后重试',
          icon: 'none'
        })
        throw this.createError('请求失败，请稍后重试', statusCode)
    }
  }

  /**
   * 处理成功响应
   * @param {Object} data 响应数据
   * @param {boolean} needAuth 是否需要认证
   * @returns {*} 业务数据
   */
  handleSuccess(data, needAuth = true, config = {}) {
    // 根据后端返回的数据结构处理
    // 假设后端返回格式：{ code: 0, data: {}, message: '' }
    if (data.code === 0 || data.code === 200) {
      return data.data
    } else {
      // 对于不需要认证的请求，错误静默处理（不显示提示），让调用方自己处理
      if (!needAuth) {
        throw this.createError(data.message || data.msg || '请求失败', data.code)
      }

      // 业务错误处理
      const errorMessage = this.getBusinessErrorMessage(data.code, data.message, needAuth)

      // 显示业务错误提示
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2500
      })

      throw this.createError(errorMessage, data.code)
    }
  }

  /**
   * 获取业务错误提示信息
   * @param {number} code 错误码
   * @param {string} message 错误信息
   * @param {boolean} needAuth 是否需要认证
   * @returns {string} 错误提示
   */
  getBusinessErrorMessage(code, message, needAuth) {
    // 定义常见错误码的提示信息
    const errorMessages = {
      400: '请求参数错误',
      401: needAuth ? '登录已过期，请重新登录' : '请求失败，请稍后重试',
      403: '权限不足',
      404: '请求的资源不存在',
      500: '服务器繁忙，请稍后重试',
      1001: '账号或密码错误',
      1002: '账号已被禁用',
      1003: '验证码错误',
      1004: '验证码已过期'
    }

    return errorMessages[code] || message || '操作失败，请稍后重试'
  }

  /**
   * 处理 Token 过期
   * @param {Object} config 请求配置
   * @param {number} retryCount 剩余重试次数
   * @returns {Promise} 重试结果
   */
  async handleTokenExpired(config, retryCount) {
    // 如果正在刷新 Token，将请求加入队列
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({
          config,
          retryCount,
          resolve,
          reject
        })
      })
    }

    // 开始刷新 Token
    this.isRefreshing = true

    try {
      // 调用刷新 Token 接口
      const auth = require('../services/auth.js')
      await auth.refreshToken()

      // 刷新成功，重新执行队列中的请求
      this.isRefreshing = false
      
      // 重新执行当前请求
      const newConfig = await this.buildRequestConfig(config)
      newConfig.needAuth = config.needAuth
      const result = await this.doRequest(newConfig, retryCount)

      // 执行队列中的其他请求
      this.executeQueue()

      return result
    } catch (error) {
      // 刷新失败，清空队列并跳转到登录页
      this.isRefreshing = false
      this.clearQueue()
      
      // 清除登录状态
      storage.clearLoginState()
      
      // 显示提示
      wx.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      })

      // 延迟跳转到登录页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 2000)

      throw error
    }
  }

  /**
   * 执行请求队列
   */
  executeQueue() {
    while (this.requestQueue.length > 0) {
      const { config, retryCount, resolve, reject } = this.requestQueue.shift()
      
      this.buildRequestConfig(config)
        .then(newConfig => {
          newConfig.needAuth = config.needAuth
          return this.doRequest(newConfig, retryCount)
        })
        .then(resolve)
        .catch(reject)
    }
  }

  /**
   * 清空请求队列
   */
  clearQueue() {
    while (this.requestQueue.length > 0) {
      const { reject } = this.requestQueue.shift()
      reject(this.createError('登录已过期', 401))
    }
  }

  /**
   * 处理网络错误
   * @param {Object} error 错误对象
   * @returns {Error} 格式化的错误对象
   */
  handleNetworkError(error) {
    let message = '网络连接失败，请检查网络设置'
    let errorType = 'NETWORK_ERROR'
    
    if (error.errMsg) {
      // 请求超时
      if (error.errMsg.includes('timeout')) {
        message = '请求超时，请稍后重试'
        errorType = 'TIMEOUT_ERROR'
      } 
      // 网络连接失败
      else if (error.errMsg.includes('fail')) {
        message = '网络连接失败，请检查网络设置'
        errorType = 'CONNECTION_ERROR'
      }
      // 请求被中断
      else if (error.errMsg.includes('abort')) {
        message = '请求已取消'
        errorType = 'ABORT_ERROR'
      }
    }
    
    // 显示错误提示
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2500
    })
    
    return this.createError(message, errorType)
  }

  /**
   * 创建错误对象
   * @param {string} message 错误信息
   * @param {number|string} code 错误码
   * @returns {Error} 错误对象
   */
  createError(message, code) {
    const error = new Error(message)
    error.code = code
    return error
  }

  /**
   * GET 请求
   * @param {string} url 请求路径
   * @param {Object} data 请求数据
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    })
  }

  /**
   * POST 请求
   * @param {string} url 请求路径
   * @param {Object} data 请求数据
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  /**
   * PUT 请求
   * @param {string} url 请求路径
   * @param {Object} data 请求数据
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  /**
   * DELETE 请求
   * @param {string} url 请求路径
   * @param {Object} data 请求数据
   * @param {Object} options 其他配置
   * @returns {Promise} 请求结果
   */
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
}

// 创建请求实例
const request = new Request()

module.exports = request
