// pages/waybill-detail/waybill-detail.js
const api = require('../../services/api.js')
const PhoneMask = require('../../utils/phone-mask.js')
const authService = require('../../services/auth.js')

Page({
  /**
   * 页面的初始数�?   */
  data: {
    // 当前标签页索引：0-电子存根�?-运输状�?    currentTab: 0,
    
    // 运单号和公司ID
    waybillCode: '',
    companyId: 0,
    
    // 验证标记
    verified: false,
    
    // 运单详情信息
    waybillInfo: {},
    
    // 物流轨迹列表
    trackList: [],
    
    // 电话号码脱敏显示
    sendPhoneMasked: '',
    collectPhoneMasked: '',
    
    // 电话号码显示状�?    showSendPhone: false,
    showCollectPhone: false,
    
    // 送货方式文本
    deliveryMethodText: '',
    // 放货方式文本
    releaseMethodText: '',
    // 回单类型文本
    receiptTypeText: '',
    // 保价文本
    insuredText: '',
    // 代收货款文本
    collectionText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { waybillCode, companyId, verified } = options
    
    // 检查必要参�?    if (!waybillCode || !companyId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
      return
    }
    
    // 检查验证标�?    if (verified !== 'true') {
      // 未验证，跳转到验证页
      wx.redirectTo({
        url: `/pages/waybill-verify/waybill-verify?waybillCode=${waybillCode}&companyId=${companyId}`
      })
      return
    }
    
    this.setData({
      waybillCode,
      companyId: parseInt(companyId),
      verified: true
    })
    
    // 加载运单详情
    this.loadWaybillInfo()
    
    // 加载物流轨迹
    this.loadTrackInfo()
    
    // 如果已登录，标记查询历史
    this.markRecentSearch()
  },

  /**
   * 标签页切�?   */
  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      currentTab: index
    })
  },

  /**
   * 加载运单详情信息
   */
  async loadWaybillInfo() {
    try {
      wx.showLoading({ title: '加载�?..' })
      
      const result = await api.getWaybillInfo(
        this.data.waybillCode,
        this.data.companyId
      )
      
      wx.hideLoading()
      
      // 处理电话号码脱敏显示
      const sendPhone = result.sendPhone || ''
      const collectPhone = result.collectPhone || ''
      const sendPhoneMasked = this.maskPhone(sendPhone)
      const collectPhoneMasked = this.maskPhone(collectPhone)
      
      // 处理服务信息文本
      const deliveryMethodText = this.getDeliveryMethodText(result.deliveryMethod)
      const releaseMethodText = this.getReleaseMethodText(result.releaseMethod)
      const receiptTypeText = this.getReceiptTypeText(result.receiptType)
      
      // 处理费用信息文本
      const insuredText = result.insuredAmount > 0 ? '�? : '�?
      const collectionText = result.collectionDelivery > 0 ? '�? : '�?

      // 格式化开单时间（使用运单创建时间�?      const createTimeFormatted = this.formatDateTime(result.waybillCreateTime || result.createTime)

      this.setData({
        waybillInfo: result,
        sendPhoneMasked,
        collectPhoneMasked,
        deliveryMethodText,
        releaseMethodText,
        receiptTypeText,
        insuredText,
        collectionText,
        createTimeFormatted
      })
    } catch (error) {
      wx.hideLoading()
      console.error('加载运单详情失败', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 加载物流轨迹信息
   */
  async loadTrackInfo() {
    try {
      const result = await api.getWaybillTrackInfo(
        this.data.waybillCode,
        this.data.companyId
      )

      // 按时间倒序排列（最新的在上面）并格式化时间
      const trackList = result.sort((a, b) => {
        return new Date(b.nodeTime || b.createTime) - new Date(a.nodeTime || a.createTime)
      }).map(item => {
        return {
          ...item,
          nodeTimeFormatted: this.formatTrackTime(item.nodeTime || item.createTime),
          nodeTimeFormattedShort: this.formatShortDate(item.nodeTime || item.createTime)
        }
      })

      this.setData({
        trackList
      })
    } catch (error) {
      console.error('加载物流轨迹失败', error)
      // 轨迹加载失败不影响页面显示，只是显示暂无数据
      this.setData({
        trackList: []
      })
    }
  },

  /**
   * 标记查询历史（需登录�?   */
  async markRecentSearch() {
    try {
      // 检查登录状�?      const isLoggedIn = authService.isLoggedIn()
      if (!isLoggedIn) {
        return
      }
      
      // 调用标记接口
      await api.markRecentSearch(
        this.data.waybillCode,
        this.data.companyId
      )
    } catch (error) {
      console.error('标记查询历史失败', error)
      // 标记失败不影响页面显�?    }
  },

  /**
   * 切换电话号码显示/隐藏
   */
  onTogglePhone(e) {
    const type = e.currentTarget.dataset.type
    
    if (type === 'send') {
      const showSendPhone = !this.data.showSendPhone
      const sendPhone = this.data.waybillInfo.sendPhone || ''
      this.setData({
        showSendPhone,
        sendPhoneMasked: showSendPhone ? sendPhone : this.maskPhone(sendPhone)
      })
    } else if (type === 'collect') {
      const showCollectPhone = !this.data.showCollectPhone
      const collectPhone = this.data.waybillInfo.collectPhone || ''
      this.setData({
        showCollectPhone,
        collectPhoneMasked: showCollectPhone ? collectPhone : this.maskPhone(collectPhone)
      })
    }
  },

  /**
   * 拨打电话
   * @param {Object} e - 事件对象
   */
  onMakePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone && phone !== 'null') {
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }
  },

  /**
   * 获取送货方式文本
   */
  getDeliveryMethodText(method) {
    if (!method) return ''
    const map = {
      1: '自提',
      2: '送货'
    }
    return map[method] || ''
  },

  /**
   * 获取放货方式文本
   */
  getReleaseMethodText(method) {
    if (!method) return ''
    const map = {
      1: '等通知',
      2: '其他'
    }
    return map[method] || ''
  },

  /**
   * 格式化回单类�?   */
  getReceiptTypeText(type) {
    if (!type) return ''
    const map = {
      1: '电子回单',
      2: '纸质回单',
      3: '拍照回单'
    }
    return map[type] || ''
  },

  /**
   * 手机号脱�?   * @param {string} phone - 手机�?   * @returns {string} 脱敏后的手机�?   */
  maskPhone(phone) {
    if (!phone) return ''
    // 如果已经是脱敏格式，直接返回
    if (phone.includes('****')) return phone
    // 如果�?1位手机号，脱敏中�?�?    if (phone.length === 11) {
      return phone.substring(0, 3) + '****' + phone.substring(7)
    }
    return phone
  },

  /**
   * 格式化日期时�?   * 将日期格式化�?YYYY/MM/DD HH:mm 格式
   * @param {string} dateStr - 日期字符�?   * @returns {string} 格式化后的日�?   */
  formatDateTime(dateStr) {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}/${month}/${day} ${hours}:${minutes}`
  },

  /**
   * 格式化物流轨迹时�?   * 将日期格式化�?YYYY-MM-DD HH:mm:ss 格式
   * @param {string} dateStr - 日期字符�?   * @returns {string} 格式化后的日�?   */
  formatTrackTime(dateStr) {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  },

  /**
   * 格式化短日期
   * 将日期格式化�?YYYY/MM/DD HH:mm 格式
   * @param {string} dateStr - 日期字符�?   * @returns {string} 格式化后的日�?   */
  formatShortDate(dateStr) {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}/${month}/${day} ${hours}:${minutes}`
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '运单详情'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 重新加载数据
    Promise.all([
      this.loadWaybillInfo(),
      this.loadTrackInfo()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函�?   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分�?   */
  onShareAppMessage() {
    return {
      title: `运单详情 - ${this.data.waybillCode}`,
      path: `/pages/waybill-verify/waybill-verify?waybillCode=${this.data.waybillCode}&companyId=${this.data.companyId}`
    }
  }
})
