// pages/notice-list/notice-list.js

// 引入API服务
const api = require('../../services/api.js')

/**
 * 通知公告列表页
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    noticeList: [],      // 公告列表
    pageNo: 1,           // 当前页码
    pageSize: 10,        // 每页数量
    hasMore: true,       // 是否还有更多数据
    loading: false,      // 是否正在加载
    companyId: null      // 公司ID（可选，用于查询指定公司的公告）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取公司ID参数（如果有）
    if (options.companyId) {
      this.setData({
        companyId: parseInt(options.companyId)
      })
    }
    
    // 加载公告列表
    this.loadNoticeList()
  },

  /**
   * 加载公告列表
   */
  async loadNoticeList() {
    // 如果正在加载或没有更多数据，则不重复加载
    if (this.data.loading || !this.data.hasMore) {
      return
    }
    
    try {
      this.setData({ loading: true })
      
      // 显示加载提示
      if (this.data.pageNo === 1) {
        wx.showLoading({ title: '加载中...' })
      }
      
      // 构建请求参数
      const params = {
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize
      }
      
      // 如果有公司ID，使用公司专用接口；否则使用通用接口
      let result
      if (this.data.companyId) {
        params.companyId = this.data.companyId
        result = await api.getComCompanyNoticePage(params)
      } else {
        result = await api.getCompanyNoticePage(params)
      }
      
      // 隐藏加载提示
      wx.hideLoading()
      
      // 处理返回数据
      const newList = this.data.pageNo === 1 
        ? result.list 
        : [...this.data.noticeList, ...result.list]
      
      // 更新数据
      this.setData({
        noticeList: newList,
        hasMore: result.list.length >= this.data.pageSize,
        loading: false
      })
    } catch (error) {
      // 隐藏加载提示
      wx.hideLoading()

      // 401错误表示需要登录，静默处理不显示错误
      if (error.code === 401) {
        console.log('公告列表需要登录才能查看')
        this.setData({
          noticeList: [],
          hasMore: false,
          loading: false
        })
        return
      }

      // 显示错误提示
      wx.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      })
      
      this.setData({ loading: false })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      this.loadNoticeList()
    }
  },

  /**
   * 点击公告项
   */
  onNoticeClick(e) {
    const noticeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${noticeId}`
    })
  },

  /**
   * 阅读详情
   * 点击阅读详情按钮跳转到公告详情页
   */
  onReadDetail(e) {
    const notice = e.currentTarget.dataset.notice
    if (!notice || !notice.id) {
      wx.showToast({
        title: '公告信息无效',
        icon: 'none'
      })
      return
    }
    
    // 将公告数据编码后传递到详情页
    const noticeData = encodeURIComponent(JSON.stringify(notice))
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${notice.id}&data=${noticeData}`
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      noticeList: []
    })
    this.loadNoticeList().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
