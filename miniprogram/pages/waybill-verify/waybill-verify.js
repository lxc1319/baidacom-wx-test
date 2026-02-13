/**
 * 运单身份验证�? * 功能：验证用户身份后才能查看运单详情
 */

const api = require('../../services/api.js')

Page({
  /**
   * 页面的初始数�?   */
  data: {
    waybillCode: '',      // 运单�?    companyId: 0,         // 物流公司ID
    logisticsCompaniesName: '', // 物流公司名称
    waybillInfo: null,    // 运单信息
    code: '',             // 验证码输入�?    currentIndex: 0,      // 当前输入位置
    autoFocus: true,      // 自动聚焦
    errorMessage: '',     // 错误提示信息
    errorCount: 0,        // 错误次数
    maxErrorCount: 3,     // 最大错误次�?    isVerifying: false    // 是否正在验证�?  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options 页面参数
   * @param {string} options.waybillCode 运单�?   * @param {number} options.companyId 物流公司ID
   */
  onLoad(options) {
    console.log('运单身份验证页加载，参数�?, options)
    
    // 获取页面参数
    const { waybillCode, companyId } = options
    
    if (!waybillCode || !companyId) {
      wx.showModal({
        title: '参数错误',
        content: '缺少必要参数，请返回重试',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
      return
    }

    // 保存参数到data
    this.setData({
      waybillCode,
      companyId: parseInt(companyId)
    })

    // 加载运单信息
    this.loadWaybillInfo()
  },

  /**
   * 加载运单信息
   * 调用API获取运单详情，用于验证和显示公司名称
   */
  async loadWaybillInfo() {
    try {
      wx.showLoading({ title: '加载�?..' })

      // 调用API获取运单信息
      const waybillInfo = await api.getWaybillInfo(
        this.data.waybillCode,
        this.data.companyId
      )

      console.log('运单信息加载成功�?, waybillInfo)

      // 保存运单信息
      this.setData({
        waybillInfo,
        logisticsCompaniesName: waybillInfo.logisticsCompaniesName || '百达物流'
      })

      wx.hideLoading()
    } catch (error) {
      console.error('加载运单信息失败�?, error)
      wx.hideLoading()
      
      wx.showModal({
        title: '加载失败',
        content: error.message || '获取运单信息失败，请返回重试',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },

  /**
   * 验证码输入变化事�?   * @param {Object} event 事件对象
   * @param {string} event.detail.value 当前输入的验证码
   */
  onCodeChange(event) {
    console.log('验证码输入变化：', event.detail.value)
    
    // 清空错误提示
    if (this.data.errorMessage) {
      this.setData({
        errorMessage: ''
      })
    }
  },

  /**
   * 验证码输入完成事件（输入�?位时自动触发�?   * @param {Object} event 事件对象
   * @param {string} event.detail.value 输入�?位验证码
   */
  onCodeComplete(event) {
    const code = event.detail.value
    console.log('验证码输入完成：', code)

    // 防止重复验证
    if (this.isVerifying) {
      console.log('正在验证中，忽略重复请求')
      return
    }

    // 执行验证
    this.verifyCode(code)
  },

  /**
   * 验证手机号后四位
   * @param {string} inputCode 用户输入�?位数�?   */
  async verifyCode(inputCode) {
    // 设置验证中状�?    this.setData({ isVerifying: true })

    // 获取寄件人和收件人手机号后四�?    const waybillInfo = this.data.waybillInfo || {}
    const { sendPhone, collectPhone } = waybillInfo
    
    // 获取手机号后四位（如果存在）
    const sendPhoneLast4 = sendPhone ? sendPhone.slice(-4) : ''
    const collectPhoneLast4 = collectPhone ? collectPhone.slice(-4) : ''

    console.log('验证信息�?, {
      inputCode,
      sendPhoneLast4,
      collectPhoneLast4
    })

    // 验证是否匹配（只要有一个匹配即可）
    const isValid = inputCode === sendPhoneLast4 || inputCode === collectPhoneLast4

    if (isValid) {
      // 验证成功
      console.log('验证成功，跳转到详情�?)
      
      wx.showToast({
        title: '验证成功',
        icon: 'success',
        duration: 1500
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        this.navigateToDetail()
      }, 1500)
    } else {
      // 验证失败
      this.handleVerifyFailed()
    }
  },

  /**
   * 处理验证失败
   * 显示错误提示，增加错误次数，延迟清空输入�?   */
  handleVerifyFailed() {
    const newErrorCount = this.data.errorCount + 1
    console.log(`验证失败，第 ${newErrorCount} 次尝试`)

    // 更新错误次数和错误提�?    this.setData({
      errorCount: newErrorCount,
      errorMessage: '验证失败，请重新输入',
      isVerifying: false
    })

    // 显示错误提示
    wx.showToast({
      title: '验证失败，请重新输入',
      icon: 'none',
      duration: 2000
    })

    // 检查是否达到最大错误次�?    if (newErrorCount >= this.data.maxErrorCount) {
      // 达到最大次数，延迟后返回上一�?      setTimeout(() => {
        wx.showModal({
          title: '验证失败',
          content: '验证次数已达上限，请稍后再试',
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      }, 2000)
    } else {
      // 未达到最大次数，延迟清空输入�?      setTimeout(() => {
        // 通过触发组件的清空方法来清空输入
        this.clearCodeInput()
      }, 2000)
    }
  },

  /**
   * 清空验证码输入框
   */
  clearCodeInput() {
    this.setData({
      code: '',
      currentIndex: 0,
      errorMessage: '',
      isVerifying: false
    })
  },

  /**
   * 输入框输入事�?   * @param {Object} e 事件对象
   */
  onInput(e) {
    const value = e.detail.value
    const code = value.replace(/\D/g, '').slice(0, 4)

    this.setData({
      code: code,
      currentIndex: code.length,
      errorMessage: ''
    })

    // 输入�?位自动验�?    if (code.length === 4) {
      this.verifyCode(code)
    }
  },

  /**
   * 输入框聚焦事�?   */
  onFocus() {
    this.setData({
      autoFocus: true
    })
  },

  /**
   * 输入框失焦事�?   */
  onBlur() {
    this.setData({
      autoFocus: false
    })
  },

  /**
   * 复制运单�?   */
  onCopyCode() {
    wx.setClipboardData({
      data: this.data.waybillCode,
      success: () => {
        wx.showToast({
          title: '已复�?,
          icon: 'success'
        })
      }
    })
  },

  /**
   * 跳转到运单详情页
   * 传递验证标记，表示已通过身份验证
   */
  navigateToDetail() {
    wx.redirectTo({
      url: `/pages/waybill-detail/waybill-detail?waybillCode=${this.data.waybillCode}&companyId=${this.data.companyId}&verified=true`
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('运单身份验证页渲染完�?)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('运单身份验证页显�?)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('运单身份验证页隐�?)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('运单身份验证页卸�?)
  }
})
