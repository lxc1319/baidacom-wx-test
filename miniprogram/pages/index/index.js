// index.js - 首页逻辑
const api = require('../../services/api');
const auth = require('../../services/auth');
const miniappConfig = require('../../config/miniapp-config');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 轮播图数据
    banners: [],

    // 查询输入
    waybillCode: '',

    // 当前选中的标签页
    currentTab: 0,

    // 运单列表
    waybillList: [],

    // 分页参数
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    refreshing: false,

    // 通知公告
    notices: [],

    // 广告列表
    adList: [],

    // 查询结果弹窗
    showResultModal: false,
    searchResults: [],

    // 骨架屏加载状态
    skeletonLoading: true,

    // 登录状态
    isLoggedIn: false,

    // 登录弹窗显示状态
    showLoginModal: false,

    // 是否显示手机号授权按钮
    showPhoneAuth: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载页面数据
    this.loadPageData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 更新登录状态
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });
  },

  /**
   * 加载页面数据
   */
  async loadPageData() {
    console.log('[首页] 开始加载页面数据...');
    try {
      // 并行加载数据
      await Promise.all([
        this.loadBanners(),
        this.loadNotices(),
        this.loadAds()
      ]);

      // 隐藏骨架屏
      this.setData({ skeletonLoading: false });
      
      // 打印最终数据状态
      console.log('[首页] 页面数据加载完成:', {
        banners: this.data.banners.length,
        notices: this.data.notices.length,
        adList: this.data.adList.length
      });
    } catch (error) {
      console.error('[首页] 页面数据加载失败:', error);
      this.setData({ skeletonLoading: false });
    }
  },

  /**
   * 加载轮播图
   */
  async loadBanners() {
    try {
      console.log('[首页] 开始加载轮播图...');
      const banners = await api.getHomeBanners();
      console.log('[首页] 轮播图加载成功:', banners);
      console.log('[首页] 轮播图数量:', banners ? banners.length : 0);
      this.setData({ banners: banners || [] });
    } catch (error) {
      console.error('[首页] 轮播图加载失败:', error);
      this.setData({ banners: [] });
    }
  },

  /**
   * 加载通知公告
   */
  async loadNotices() {
    try {
      console.log('[首页] 开始加载通知公告...');
      const result = await api.getHomeNotices();
      console.log('[首页] 通知公告加载成功:', result);
      // 分页接口返回 { list: [], total: 0 }
      const notices = result && result.list ? result.list : (Array.isArray(result) ? result : []);
      console.log('[首页] 通知公告数量:', notices.length);
      this.setData({ notices: notices });
    } catch (error) {
      console.error('[首页] 通知公告加载失败:', error);
      this.setData({ notices: [] });
    }
  },

  /**
   * 加载底部广告
   */
  async loadAds() {
    try {
      console.log('[首页] 开始加载底部广告...');
      const ads = await api.getHomeAds();
      console.log('[首页] 底部广告加载成功:', ads);
      console.log('[首页] 底部广告数量:', ads ? ads.length : 0);
      this.setData({ adList: ads || [] });
    } catch (error) {
      console.error('[首页] 底部广告加载失败:', error);
      this.setData({ adList: [] });
    }
  },

  /**
   * 点击轮播图
   */
  onBannerClick(e) {
    const { banner } = e.detail;
    const link = banner.linkUrl || banner.link;
    if (link) {
      wx.navigateTo({ url: link });
    }
  },

  /**
   * 扫码
   */
  onScanCode() {
    wx.scanCode({
      success: (res) => {
        this.setData({ waybillCode: res.result });
        this.onSearch();
      }
    });
  },

  /**
   * 运单号输入
   */
  onWaybillInput(e) {
    this.setData({ waybillCode: e.detail.value });
  },

  /**
   * 清除运单号输入
   */
  onClearInput() {
    this.setData({ waybillCode: '' });
  },

  /**
   * 查询运单（未登录时先登录）
   * 临时测试模式：自动使用测试账号登录
   */
  async onSearchWithLogin() {
    console.log('[首页] onSearchWithLogin 被调用');
    const waybillCode = this.data.waybillCode.trim();
    console.log('[首页] 运单号:', waybillCode);
    if (!waybillCode) {
      wx.showToast({
        title: '请输入运单号',
        icon: 'none'
      });
      return;
    }

    // 检查是否已登录
    const isLoggedIn = auth.isLoggedIn();
    console.log('[首页] 登录状态:', isLoggedIn);

    if (isLoggedIn) {
      // 已登录，直接查询
      console.log('[首页] 已登录，直接查询');
      this.onSearch();
    } else {
      // 未登录，显示登录弹窗
      console.log('[首页] 未登录，显示登录弹窗');
      this.setData({ showLoginModal: true });
    }
  },

  /**
   * 查询运单
   */
  async onSearch() {
    const waybillCode = this.data.waybillCode.trim();
    if (!waybillCode) {
      wx.showToast({
        title: '请输入运单号',
        icon: 'none'
      });
      return;
    }

    // 未登录时显示登录弹窗
    if (!this.data.isLoggedIn) {
      this.setData({ showLoginModal: true });
      return;
    }

    wx.showLoading({ title: '查询中...' });

    try {
      const results = await api.searchWaybill(waybillCode);
      wx.hideLoading();
      
      console.log('[首页] 查询结果:', results);

      this.setData({
        searchResults: results || [],
        showResultModal: true
      });
      
      console.log('[首页] 显示查询结果弹窗, 数据条数:', results ? results.length : 0);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      });
    }
  },

  /**
   * 标签页切换
   */
  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      currentTab: index,
      pageNo: 1,
      hasMore: true,
      waybillList: []
    });
  },

  /**
   * 点击通知公告
   */
  onNoticeClick() {
    wx.navigateTo({
      url: '/pages/notice-list/notice-list'
    });
  },

  /**
   * 点击广告
   * 支持跳转到公司详情页或自定义链接
   */
  onAdClick(e) {
    const item = e.currentTarget.dataset.item;
    console.log('[首页] 点击广告:', item);
    
    // 如果有 companyId，跳转到公司详情页
    if (item.companyId) {
      wx.navigateTo({
        url: `/pages/company-detail/company-detail?companyId=${item.companyId}`
      });
      return;
    }
    
    // 如果有 link 字段，跳转到指定链接
    if (item.link) {
      wx.navigateTo({ url: item.link });
      return;
    }
    
    // 如果有 linkUrl 字段，跳转到指定链接
    if (item.linkUrl) {
      wx.navigateTo({ url: item.linkUrl });
      return;
    }
    
    console.log('[首页] 广告没有配置跳转链接');
  },

  /**
   * 关闭查询结果弹窗
   */
  onCloseResultModal() {
    this.setData({ showResultModal: false });
  },

  /**
   * 关闭登录弹窗
   */
  onCloseLoginModal() {
    this.setData({ 
      showLoginModal: false,
      showPhoneAuth: false
    });
  },

  /**
   * 确认登录（参考 baidacom-wx-1 实现）
   * 先调用 wxLogin，根据返回结果判断是否需要手机号授权
   */
  async onConfirmLogin() {
    wx.showLoading({ title: '登录中...' });

    try {
      // 1. 先调用微信登录获取 openId
      const loginResult = await auth.weixinLogin();
      wx.hideLoading();

      if (loginResult.success) {
        // 已注册，登录成功
        this.setData({ 
          showLoginModal: false,
          isLoggedIn: true 
        });

        // 继续之前的查询
        if (this.data.waybillCode) {
          this.onSearch();
        }
      } else if (loginResult.needPhone) {
        // 未注册，需要获取手机号
        // 保持登录弹窗打开，但切换为手机号授权模式
        this.setData({ 
          showPhoneAuth: true 
        });
      } else {
        // 登录失败
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('[首页] 登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  /**
   * 获取手机号并注册（参考 baidacom-wx-1 实现）
   * @param {Object} e 事件对象
   */
  async onGetPhoneNumber(e) {
    console.log('[首页] 获取手机号事件:', e);
    
    // 用户拒绝授权
    if (e.detail.errMsg && e.detail.errMsg.includes('deny')) {
      wx.showToast({
        title: '需要授权手机号才能登录',
        icon: 'none'
      });
      return;
    }
    
    // 获取手机号授权码
    const phoneCode = e.detail.code;
    if (!phoneCode) {
      wx.showToast({
        title: '获取手机号失败',
        icon: 'none'
      });
      return;
    }
    
    console.log('[首页] 手机号授权码:', phoneCode);
    
    wx.showLoading({ title: '正在登录...' });
    
    try {
      // 调用手机号注册接口
      await auth.wxRegisterByCode(phoneCode);
      wx.hideLoading();
      
      // 注册成功，关闭弹窗并更新登录状态
      this.setData({ 
        showLoginModal: false,
        showPhoneAuth: false,
        isLoggedIn: true 
      });
      
      // 继续之前的查询
      if (this.data.waybillCode) {
        this.onSearch();
      }
    } catch (error) {
      wx.hideLoading();
      console.error('[首页] 手机号注册失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  /**
   * 查优质物流线路
   * 跳转到线路查询小程序
   */
  onRouteQuery() {
    // 弹出确认对话框
    wx.showModal({
      title: '提示',
      content: '即将跳转到线路查询小程序，是否继续？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认，执行跳转
          this.navigateToRouteQueryMiniApp();
        }
      }
    });
  },

  /**
   * 跳转到线路查询小程序
   */
  navigateToRouteQueryMiniApp() {
    const config = miniappConfig.routeQuery;

    wx.navigateToMiniProgram({
      appId: config.appId,
      path: config.path,
      extraData: config.extraData,
      envVersion: config.envVersion,
      success: (res) => {
        console.log('跳转线路查询小程序成功', res);
      },
      fail: (error) => {
        console.error('跳转线路查询小程序失败', error);
        this.handleNavigateError(error);
      }
    });
  },

  /**
   * 网点快捷下单
   * 跳转到下单小程序
   */
  onQuickOrder() {
    // 弹出确认对话框
    wx.showModal({
      title: '提示',
      content: '即将跳转到下单小程序，是否继续？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认，执行跳转
          this.navigateToQuickOrderMiniApp();
        }
      }
    });
  },

  /**
   * 跳转到下单小程序
   */
  navigateToQuickOrderMiniApp() {
    const config = miniappConfig.quickOrder;

    wx.navigateToMiniProgram({
      appId: config.appId,
      path: config.path,
      extraData: config.extraData,
      envVersion: config.envVersion,
      success: (res) => {
        console.log('跳转下单小程序成功', res);
      },
      fail: (error) => {
        console.error('跳转下单小程序失败', error);
        this.handleNavigateError(error);
      }
    });
  },

  /**
   * 处理小程序跳转错误
   * @param {Object} error 错误对象
   */
  handleNavigateError(error) {
    // 用户取消跳转
    if (error.errMsg && error.errMsg.includes('cancel')) {
      console.log('用户取消跳转');
      return;
    }

    // 目标小程序未找到
    if (error.errMsg && error.errMsg.includes('not found')) {
      wx.showModal({
        title: '提示',
        content: '目标小程序暂不可用，请联系客服',
        showCancel: false
      });
      return;
    }

    // 其他错误
    wx.showToast({
      title: '跳转失败，请重试',
      icon: 'none'
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});
