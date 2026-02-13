// pages/notice-detail/notice-detail.js

// 引入API服务
const api = require('../../services/api.js')

/**
 * 通知公告详情页
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    noticeDetail: null,  // 公告详情数据
    loading: false       // 是否正在加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id, data } = options
    
    // 如果有传递数据，直接使用
    if (data) {
      try {
        const noticeData = JSON.parse(decodeURIComponent(data))
        // 格式化时间
        if (noticeData.createTime) {
          noticeData.createTime = this.formatDate(noticeData.createTime)
        }
        this.setData({ noticeDetail: noticeData })
      } catch (error) {
        console.error('解析公告数据失败:', error)
        // 解析失败，尝试调用接口获取
        this.loadNoticeDetail(id)
      }
    } else {
      // 没有传递数据，调用接口获取
      this.loadNoticeDetail(id)
    }
  },

  /**
   * 加载公告详情
   */
  async loadNoticeDetail(id) {
    if (!id) {
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
    
    try {
      this.setData({ loading: true })
      
      // 显示加载提示
      wx.showLoading({ title: '加载中...' })
      
      // 尝试调用详情接口
      const result = await api.getCompanyNotice(id)
      
      // 隐藏加载提示
      wx.hideLoading()
      
      // 格式化时间
      if (result.createTime) {
        result.createTime = this.formatDate(result.createTime)
      }
      
      // 更新数据
      this.setData({ 
        noticeDetail: result,
        loading: false
      })
    } catch (error) {
      // 隐藏加载提示
      wx.hideLoading()
      
      // 如果接口调用失败（权限不足），显示错误提示
      wx.showToast({ 
        title: '加载失败，请从列表页进入', 
        icon: 'none',
        duration: 2000
      })
      
      // 更新加载状态
      this.setData({ loading: false })
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
      
      console.error('加载公告详情失败:', error)
    }
  },

  /**
   * 格式化时间戳为日期字符串
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的日期字符串 xxxx-xx-xx
   */
  formatDate(timestamp) {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面渲染完成
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 不支持下拉刷新
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 详情页不需要上拉加载
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.noticeDetail ? this.data.noticeDetail.title : '通知公告详情',
      path: `/pages/notice-detail/notice-detail?id=${this.data.noticeDetail.id}`
    }
  }
})
