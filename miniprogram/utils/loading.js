/**
 * 加载提示管理
 * 统一管理页面加载状态
 */

class LoadingManager {
  constructor() {
    this.loadingCount = 0
    this.isShowing = false
    this.defaultConfig = {
      title: '加载中...',
      mask: true
    }
    this.autoHideTimer = null
    this.maxShowTime = 30000
  }

  /**
   * 显示加载提示
   * @param {Object} options 配置选项
   */
  show(options = {}) {
    this.loadingCount++
    
    if (this.isShowing) {
      return
    }
    
    const config = {
      ...this.defaultConfig,
      ...options
    }
    
    wx.showLoading({
      title: config.title,
      mask: config.mask
    })
    
    this.isShowing = true
    
    this.clearAutoHideTimer()
    this.autoHideTimer = setTimeout(() => {
      this.forceHide()
    }, this.maxShowTime)
  }

  /**
   * 隐藏加载提示
   */
  hide() {
    this.loadingCount--
    
    if (this.loadingCount > 0) {
      return
    }
    
    this.forceHide()
  }

  /**
   * 强制隐藏加载提示
   */
  forceHide() {
    this.loadingCount = 0
    this.isShowing = false
    this.clearAutoHideTimer()
    wx.hideLoading()
  }

  /**
   * 设置自动隐藏定时器
   */
  setAutoHideTimer() {
    this.clearAutoHideTimer()
    
    this.autoHideTimer = setTimeout(() => {
      this.forceHide()
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
   * @param {number} duration 显示时长
   */
  showSuccess(title = '操作成功', duration = 1500) {
    this.forceHide()
    
    wx.showToast({
      title: title,
      icon: 'success',
      duration: duration
    })
  }

  /**
   * 显示失败提示
   * @param {string} title 提示文字
   * @param {number} duration 显示时长
   */
  showError(title = '操作失败', duration = 1500) {
    this.forceHide()
    
    wx.showToast({
      title: title,
      icon: 'none',
      duration: duration
    })
  }
}

const loading = new LoadingManager()

module.exports = loading
