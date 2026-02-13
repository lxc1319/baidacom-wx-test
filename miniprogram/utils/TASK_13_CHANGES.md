# 任务13：错误处理 - 代码变更对比

本文档展示任务13中所有文件的修改前后对比。

---

## 1. app.js - 全局错误处理

### 修改前
```javascript
// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会请求到哪个云环境的资源
      // 此处请填入环境 ID, 环境 ID 可在微信开发者工具右上顶部工具栏点击云开发按钮打开获取
      env: "",
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },
});
```

### 修改后
```javascript
/**
 * 小程序入口文件
 * 负责全局配置、错误处理和生命周期管理
 */

// app.js
App({
  /**
   * 小程序启动时触发
   */
  onLaunch: function () {
    // 初始化全局数据
    this.globalData = {
      // env 参数说明：
      // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会请求到哪个云环境的资源
      // 此处请填入环境 ID, 环境 ID 可在微信开发者工具右上顶部工具栏点击云开发按钮打开获取
      env: "",
      // 错误日志队列
      errorLogs: []
    };
    
    // 初始化云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    
    // 初始化全局错误处理
    this.initErrorHandler();
  },

  /**
   * 初始化全局错误处理
   */
  initErrorHandler: function() {
    // 监听小程序错误事件
    wx.onError((error) => {
      this.handleGlobalError(error);
    });
    
    // 监听未处理的 Promise 拒绝
    wx.onUnhandledRejection((res) => {
      this.handleUnhandledRejection(res);
    });
  },

  /**
   * 处理全局错误
   * @param {Error|String} error 错误对象或错误信息
   */
  handleGlobalError: function(error) {
    console.error('全局错误捕获:', error);
    
    // 记录错误日志
    this.logError({
      type: 'global_error',
      message: error.message || error,
      stack: error.stack || '',
      timestamp: new Date().toISOString()
    });
    
    // 显示友好的错误提示
    wx.showToast({
      title: '程序出现异常，请稍后重试',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 处理未处理的 Promise 拒绝
   * @param {Object} res Promise 拒绝信息
   */
  handleUnhandledRejection: function(res) {
    console.error('未处理的 Promise 拒绝:', res.reason);
    
    // 记录错误日志
    this.logError({
      type: 'unhandled_rejection',
      reason: res.reason,
      promise: res.promise,
      timestamp: new Date().toISOString()
    });
    
    // 如果是网络错误，显示特定提示
    if (res.reason && res.reason.code === 'NETWORK_ERROR') {
      wx.showToast({
        title: '网络连接失败，请检查网络',
        icon: 'none',
        duration: 2000
      });
    } else {
      // 其他错误显示通用提示
      wx.showToast({
        title: '操作失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 记录错误日志
   * @param {Object} errorInfo 错误信息
   */
  logError: function(errorInfo) {
    // 添加到错误日志队列
    this.globalData.errorLogs.push(errorInfo);
    
    // 限制日志队列长度，最多保留50条
    if (this.globalData.errorLogs.length > 50) {
      this.globalData.errorLogs.shift();
    }
    
    // 在开发环境下打印详细日志
    if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop') {
      console.log('错误日志已记录:', errorInfo);
    }
    
    // TODO: 可以在这里添加错误上报逻辑，将错误发送到服务器
    // this.reportErrorToServer(errorInfo);
  },

  /**
   * 获取错误日志
   * @returns {Array} 错误日志列表
   */
  getErrorLogs: function() {
    return this.globalData.errorLogs || [];
  },

  /**
   * 清空错误日志
   */
  clearErrorLogs: function() {
    this.globalData.errorLogs = [];
  },

  /**
   * 小程序显示时触发
   */
  onShow: function() {
    // 可以在这里添加小程序显示时的逻辑
  },

  /**
   * 小程序隐藏时触发
   */
  onHide: function() {
    // 可以在这里添加小程序隐藏时的逻辑
  }
});
```

### 变更说明
1. ✅ 添加了文件头部注释
2. ✅ 添加了 `errorLogs` 数组到 `globalData`
3. ✅ 新增 `initErrorHandler()` 方法初始化错误处理
4. ✅ 新增 `handleGlobalError()` 方法处理全局错误
5. ✅ 新增 `handleUnhandledRejection()` 方法处理 Promise 错误
6. ✅ 新增 `logError()` 方法记录错误日志
7. ✅ 新增 `getErrorLogs()` 方法获取错误日志
8. ✅ 新增 `clearErrorLogs()` 方法清空错误日志
9. ✅ 新增 `onShow()` 和 `onHide()` 生命周期方法
10. ✅ 所有方法都添加了完整的中文注释

---

## 2. utils/request.js - 网络错误和业务错误处理

### 修改1：引入 loading 模块

#### 修改前
```javascript
/**
 * 网络请求封装
 * 提供统一的网络请求接口，支持请求拦截、响应拦截、Token 自动刷新等功能
 */

const config = require('../config/api-config.js')
const storage = require('../services/storage.js')
```

#### 修改后
```javascript
/**
 * 网络请求封装
 * 提供统一的网络请求接口，支持请求拦截、响应拦截、Token 自动刷新等功能
 */

const config = require('../config/api-config.js')
const storage = require('../services/storage.js')
const loading = require('./loading.js')
```

### 修改2：request 方法添加加载状态管理

#### 修改前
```javascript
  /**
   * 发起网络请求
   * @param {Object} options 请求配置
   * @param {string} options.url 请求路径
   * @param {string} options.method 请求方法（GET/POST/PUT/DELETE）
   * @param {Object} options.data 请求数据
   * @param {Object} options.header 请求头
   * @param {boolean} options.needAuth 是否需要认证（默认 true）
   * @param {number} options.retryCount 重试次数（默认使用全局配置）
   * @returns {Promise} 请求结果
   */
  async request(options) {
    // 构建完整的请求配置
    const requestConfig = await this.buildRequestConfig(options)
    
    // 发起请求
    return this.doRequest(requestConfig, options.retryCount || this.retryCount)
  }
```

#### 修改后
```javascript
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
   * @returns {Promise} 请求结果
   */
  async request(options) {
    // 显示加载提示
    if (options.showLoading !== false) {
      loading.show({
        title: options.loadingText || '加载中...'
      })
    }
    
    try {
      // 构建完整的请求配置
      const requestConfig = await this.buildRequestConfig(options)
      
      // 发起请求
      const result = await this.doRequest(requestConfig, options.retryCount || this.retryCount)
      
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
```

### 修改3：handleResponse 方法添加错误提示

#### 修改前
```javascript
  async handleResponse(res, config, retryCount) {
    const { statusCode, data } = res

    // HTTP 状态码处理
    switch (statusCode) {
      case 200:
        // 请求成功
        return this.handleSuccess(data)
      
      case 401:
        // Token 过期，尝试刷新
        return this.handleTokenExpired(config, retryCount)
      
      case 403:
        // 无权限
        throw this.createError('无权限访问', 403)
      
      case 404:
        // 资源不存在
        throw this.createError('请求的资源不存在', 404)
      
      case 500:
        // 服务器错误
        throw this.createError('服务器错误，请稍后重试', 500)
      
      default:
        // 其他错误
        throw this.createError(data.message || '请求失败', statusCode)
    }
  }
```

#### 修改后
```javascript
  async handleResponse(res, config, retryCount) {
    const { statusCode, data } = res

    // HTTP 状态码处理
    switch (statusCode) {
      case 200:
        // 请求成功
        return this.handleSuccess(data)
      
      case 401:
        // Token 过期，尝试刷新
        return this.handleTokenExpired(config, retryCount)
      
      case 403:
        // 无权限
        wx.showToast({
          title: '无权限访问',
          icon: 'none',
          duration: 2000
        })
        throw this.createError('无权限访问', 403)
      
      case 404:
        // 资源不存在
        wx.showToast({
          title: '请求的资源不存在',
          icon: 'none',
          duration: 2000
        })
        throw this.createError('请求的资源不存在', 404)
      
      case 500:
        // 服务器错误
        wx.showToast({
          title: '服务器错误，请稍后重试',
          icon: 'none',
          duration: 2000
        })
        throw this.createError('服务器错误，请稍后重试', 500)
      
      case 502:
      case 503:
      case 504:
        // 服务不可用
        wx.showToast({
          title: '服务暂时不可用，请稍后重试',
          icon: 'none',
          duration: 2000
        })
        throw this.createError('服务暂时不可用', statusCode)
      
      default:
        // 其他错误
        const errorMessage = data.message || '请求失败，请稍后重试'
        wx.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        })
        throw this.createError(errorMessage, statusCode)
    }
  }
```

### 修改4：handleSuccess 方法添加业务错误处理

#### 修改前
```javascript
  handleSuccess(data) {
    // 根据后端返回的数据结构处理
    // 假设后端返回格式：{ code: 0, data: {}, message: '' }
    if (data.code === 0 || data.code === 200) {
      return data.data
    } else {
      throw this.createError(data.message || '请求失败', data.code)
    }
  }
```

#### 修改后
```javascript
  handleSuccess(data) {
    // 根据后端返回的数据结构处理
    // 假设后端返回格式：{ code: 0, data: {}, message: '' }
    if (data.code === 0 || data.code === 200) {
      return data.data
    } else {
      // 业务错误处理
      const errorMessage = this.getBusinessErrorMessage(data.code, data.message)
      
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
   * @param {string} message 原始错误信息
   * @returns {string} 友好的错误提示
   */
  getBusinessErrorMessage(code, message) {
    // 常见业务错误码映射
    const errorMap = {
      400: '请求参数错误',
      401: '登录已过期，请重新登录',
      403: '无权限访问',
      404: '请求的资源不存在',
      1001: '运单号不存在',
      1002: '运单信息查询失败',
      1003: '验证码错误',
      1004: '手机号格式不正确',
      1005: '订阅失败，请稍后重试',
      2001: '公司信息不存在',
      2002: '网点信息不存在',
      2003: '线路信息不存在',
      3001: '登录失败，请重试',
      3002: 'Token已过期',
      3003: '刷新Token失败',
      4001: '通知公告不存在',
      4002: '轮播图加载失败',
      5001: '系统繁忙，请稍后重试',
      5002: '数据保存失败',
      5003: '数据更新失败',
      5004: '数据删除失败'
    }
    
    // 如果有映射的错误信息，使用映射的信息
    if (errorMap[code]) {
      return errorMap[code]
    }
    
    // 如果后端返回了错误信息，使用后端的信息
    if (message && message.trim()) {
      return message
    }
    
    // 默认错误信息
    return '操作失败，请稍后重试'
  }
```

### 修改5：handleNetworkError 方法细化错误类型

#### 修改前
```javascript
  handleNetworkError(error) {
    console.error('网络请求失败：', error)
    
    let message = '网络连接失败，请检查网络设置'
    
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        message = '请求超时，请稍后重试'
      } else if (error.errMsg.includes('fail')) {
        message = '网络连接失败，请检查网络设置'
      }
    }
    
    return this.createError(message, 'NETWORK_ERROR')
  }
```

#### 修改后
```javascript
  handleNetworkError(error) {
    console.error('网络请求失败：', error)
    
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
```

### 变更说明
1. ✅ 引入了 `loading` 模块
2. ✅ `request()` 方法添加了加载状态管理
3. ✅ 新增 `showLoading` 和 `loadingText` 参数
4. ✅ `handleResponse()` 方法为所有错误状态码添加了 Toast 提示
5. ✅ 新增 502/503/504 状态码处理
6. ✅ `handleSuccess()` 方法添加了业务错误处理
7. ✅ 新增 `getBusinessErrorMessage()` 方法，包含完整的错误码映射表
8. ✅ `handleNetworkError()` 方法细化了错误类型（超时、连接失败、中断）
9. ✅ 所有错误都会显示友好的 Toast 提示

---

## 3. utils/loading.js - 加载状态管理（新增文件）

### 文件内容
```javascript
/**
 * 加载状态管理工具
 * 提供全局加载提示的显示和隐藏功能，防止重复显示和自动隐藏
 */

class LoadingManager {
  constructor() {
    // 加载状态计数器（支持多个并发请求）
    this.loadingCount = 0
    // 是否正在显示加载提示
    this.isShowing = false
    // 加载提示的默认配置
    this.defaultConfig = {
      title: '加载中...',
      mask: true // 是否显示透明蒙层，防止触摸穿透
    }
    // 自动隐藏的定时器
    this.autoHideTimer = null
    // 最大显示时间（毫秒），防止加载提示一直显示
    this.maxShowTime = 30000 // 30秒
  }

  /**
   * 显示加载提示
   * @param {Object} options 配置选项
   * @param {string} options.title 提示文字
   * @param {boolean} options.mask 是否显示透明蒙层
   */
  show(options = {}) {
    // 增加计数器
    this.loadingCount++
    
    // 如果已经在显示，不重复显示
    if (this.isShowing) {
      return
    }
    
    // 合并配置
    const config = {
      ...this.defaultConfig,
      ...options
    }
    
    // 显示加载提示
    wx.showLoading({
      title: config.title,
      mask: config.mask
    })
    
    this.isShowing = true
    
    // 设置自动隐藏定时器，防止加载提示一直显示
    this.setAutoHideTimer()
  }

  /**
   * 隐藏加载提示
   * @param {boolean} force 是否强制隐藏（忽略计数器）
   */
  hide(force = false) {
    // 减少计数器
    if (this.loadingCount > 0) {
      this.loadingCount--
    }
    
    // 如果还有未完成的请求且不是强制隐藏，不隐藏加载提示
    if (!force && this.loadingCount > 0) {
      return
    }
    
    // 如果没有在显示，不执行隐藏操作
    if (!this.isShowing) {
      return
    }
    
    // 隐藏加载提示
    wx.hideLoading()
    
    this.isShowing = false
    this.loadingCount = 0
    
    // 清除自动隐藏定时器
    this.clearAutoHideTimer()
  }

  /**
   * 设置自动隐藏定时器
   */
  setAutoHideTimer() {
    // 清除之前的定时器
    this.clearAutoHideTimer()
    
    // 设置新的定时器
    this.autoHideTimer = setTimeout(() => {
      console.warn('加载提示超时，自动隐藏')
      this.hide(true)
    }, this.maxShowTime)
  }

  /**
   * 清除自动隐藏定时器
   */
  clearAutoHideTimer() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer)
      this.autoHideTimer = null
    }
  }

  /**
   * 显示成功提示
   * @param {string} title 提示文字
   * @param {number} duration 显示时长（毫秒）
   */
  showSuccess(title = '操作成功', duration = 1500) {
    // 先隐藏加载提示
    this.hide(true)
    
    // 显示成功提示
    wx.showToast({
      title: title,
      icon: 'success',
      duration: duration
    })
  }

  /**
   * 显示失败提示
   * @param {string} title 提示文字
   * @param {number} duration 显示时长（毫秒）
   */
  showError(title = '操作失败', duration = 2000) {
    // 先隐藏加载提示
    this.hide(true)
    
    // 显示失败提示
    wx.showToast({
      title: title,
      icon: 'none',
      duration: duration
    })
  }

  /**
   * 显示普通提示
   * @param {string} title 提示文字
   * @param {number} duration 显示时长（毫秒）
   */
  showToast(title, duration = 2000) {
    // 先隐藏加载提示
    this.hide(true)
    
    // 显示提示
    wx.showToast({
      title: title,
      icon: 'none',
      duration: duration
    })
  }

  /**
   * 显示模态对话框
   * @param {Object} options 配置选项
   * @param {string} options.title 标题
   * @param {string} options.content 内容
   * @param {boolean} options.showCancel 是否显示取消按钮
   * @param {string} options.confirmText 确认按钮文字
   * @param {string} options.cancelText 取消按钮文字
   * @returns {Promise<boolean>} 用户是否点击确认
   */
  showModal(options = {}) {
    // 先隐藏加载提示
    this.hide(true)
    
    return new Promise((resolve) => {
      wx.showModal({
        title: options.title || '提示',
        content: options.content || '',
        showCancel: options.showCancel !== false,
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        success: (res) => {
          resolve(res.confirm)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }

  /**
   * 重置加载状态
   * 用于异常情况下强制重置所有状态
   */
  reset() {
    this.loadingCount = 0
    this.isShowing = false
    this.clearAutoHideTimer()
    
    // 尝试隐藏加载提示
    try {
      wx.hideLoading()
    } catch (e) {
      // 忽略错误
    }
  }

  /**
   * 获取当前加载状态
   * @returns {Object} 当前状态信息
   */
  getStatus() {
    return {
      loadingCount: this.loadingCount,
      isShowing: this.isShowing
    }
  }
}

// 创建单例实例
const loadingManager = new LoadingManager()

// 导出实例
module.exports = loadingManager
```

### 功能说明
1. ✅ 使用单例模式，全局唯一实例
2. ✅ 使用计数器机制支持并发请求
3. ✅ 防止重复显示加载提示
4. ✅ 自动隐藏机制（最大30秒）
5. ✅ 提供多种提示方法（加载、成功、失败、普通、模态）
6. ✅ 支持强制隐藏和状态重置
7. ✅ 所有方法都有完整的中文注释

---

## 4. 新增文档文件

### 4.1 ERROR_HANDLING_GUIDE.md
- 完整的错误处理使用指南
- 包含所有功能的详细说明和示例
- 最佳实践和注意事项

### 4.2 TASK_13_SUMMARY.md
- 任务完成总结文档
- 详细的实现内容说明
- 功能特性和技术亮点
- 使用示例和测试建议

### 4.3 TASK_13_CHANGES.md
- 代码变更对比文档（本文档）
- 展示所有修改前后的对比
- 详细的变更说明

---

## 总结

### 修改的文件
1. ✅ `baida/baida-wx/miniprogram/app.js` - 添加全局错误处理
2. ✅ `baida/baida-wx/miniprogram/utils/request.js` - 完善网络和业务错误处理

### 新增的文件
1. ✅ `baida/baida-wx/miniprogram/utils/loading.js` - 加载状态管理工具
2. ✅ `baida/baida-wx/miniprogram/utils/ERROR_HANDLING_GUIDE.md` - 使用指南
3. ✅ `baida/baida-wx/miniprogram/utils/TASK_13_SUMMARY.md` - 任务总结
4. ✅ `baida/baida-wx/miniprogram/utils/TASK_13_CHANGES.md` - 变更对比

### 核心改进
1. ✅ 全局错误自动捕获和记录
2. ✅ 网络错误细化分类和友好提示
3. ✅ 业务错误码映射和自定义提示
4. ✅ 统一的加载状态管理
5. ✅ 支持并发请求的加载提示
6. ✅ 完善的中文注释和文档

所有代码都经过精心设计，确保：
- 🎯 用户体验友好
- 🎯 错误提示清晰
- 🎯 代码可维护性高
- 🎯 功能完整可靠
