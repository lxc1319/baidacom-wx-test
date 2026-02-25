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
    // 加载页面数据（不登录）
    this.loadPageData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 更新登录状态
    const isLoggedIn = auth.isLoggedIn();
    // 从本地存储中获取用户手机号
    const userPhone = wx.getStorageSync('userPhone') || '';
    this.setData({ 
      isLoggedIn,
      userPhone
    });
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

      // 加载最近查询列表（如果已登录）
      if (auth.isLoggedIn()) {
        this.loadRecentSearchList();
      }

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
   * 扫码获取运单号
   */
  async onScanCode() {
    wx.scanCode({
      success: async (res) => {
        console.log('[首页] 扫码结果:', res);
        this.setData({ waybillCode: res.result });
        // 使用onSearchWithLogin确保登录流程正确处理
        await this.onSearchWithLogin();
      },
      fail: (err) => {
        console.error('[首页] 扫码失败:', err);
        wx.showToast({
          title: '扫码失败，请重试',
          icon: 'none'
        });
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
   * 查询运单（首次查询需要登录）
   * 使用微信手机号授权登录
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
    console.log('[首页] Token:', wx.getStorageSync('token'));
    console.log('[首页] 租户ID:', wx.getStorageSync('tenant_id'));

    if (isLoggedIn) {
      // 已登录，直接查询
      console.log('[首页] 已登录，直接查询');
      this.onSearch();
    } else {
      // 未登录，使用微信登录
      console.log('[首页] 未登录，使用微信登录');
      await this.dealLogin();
    }
  },

  /**
   * 微信登录流程（点击查询时调用）
   * 1. 获取用户信息
   * 2. 获取 code
   * 3. 调用后端登录接口
   */
  async dealLogin() {
    console.log('[首页] dealLogin 开始');
    
    try {
      // 1. 先获取用户信息（昵称、头像）
      const userRes = await new Promise((resolve, reject) => {
        wx.getUserInfo({
          success: resolve,
          fail: reject
        });
      });
      
      const userProfile = userRes.userInfo;
      console.log('[首页] 获取用户信息:', userProfile);
      
      // 清理头像URL中的反引号
      let avatarUrl = userProfile.avatarUrl || '';
      console.log('[首页] 清理前 avatarUrl:', avatarUrl);
      if (avatarUrl) {
        avatarUrl = avatarUrl.replace(/[`]/g, '').trim();
      }
      console.log('[首页] 清理后 avatarUrl:', avatarUrl);
      
      // 2. 获取 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });
      
      console.log('[首页] 获取 code:', loginRes);
      
      if (!loginRes.code) {
        wx.showToast({
          title: '获取微信登录凭证失败',
          icon: 'none'
        });
        return;
      }
      
      // 3. 调用后端登录接口
      await this.requestWxLoginApi({
        code: loginRes.code,
        nickname: userProfile.nickName || '',
        avatar: avatarUrl
      });
    } catch (error) {
      console.error('[首页] 微信登录失败:', error);
      wx.showToast({
        title: '获取微信信息失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 请求后端微信登录接口
   */
  async requestWxLoginApi(data) {
    console.log('[首页] requestWxLoginApi:', data);
    
    try {
      const result = await auth.wxLogin(data);
      console.log('[首页] wxLogin 响应:', result);
      
      // 存储 openId
      this.wxOpenId = result.openId;
      
      if (result.userId) {
        // 已注册，登录成功
        await auth.setUserInfo(result);
        this.setData({ isLoggedIn: true });
        
        // 存储用户手机号
        if (result.userInfo && result.userInfo.mobile) {
          this.setData({ userPhone: result.userInfo.mobile });
          wx.setStorageSync('userPhone', result.userInfo.mobile);
        }
        
        // 登录成功后执行查询
        this.onSearch();
      } else {
        // 未注册，需要授权获取手机号，显示登录弹窗
        this.setData({ 
          showLoginModal: true,
          showPhoneAuth: true 
        });
      }
    } catch (error) {
      console.error('[首页] 微信登录接口调用失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  /**
   * 查询运单
   * 查询成功后标记最近查询并刷新列表
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

    try {
      // 先从系统内部查询
      const results = await api.searchWaybill(waybillCode);
      
      console.log('[首页] 查询结果:', results);

      if (results && results.length > 0) {
        // 查询到结果，显示结果弹窗
        this.setData({
          searchResults: results,
          showResultModal: true
        });
        console.log('[首页] 显示查询结果弹窗, 数据条数:', results.length);
        
        // 标记为最近查询
        try {
          await api.markRecentSearch(waybillCode, results[0].companyId);
          console.log('[首页] 标记最近查询成功');
        } catch (error) {
          console.log('[首页] 标记最近查询失败:', error);
        }
        
        // 刷新最近查询列表
        this.loadRecentSearchList();
      } else {
        // 未查询到结果
        wx.showToast({
          title: '未查询到订单',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[首页] 查询失败:', error);
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      });
    }
  },

  /**
   * 标签页切换（参考 baidacom-wx-1 实现）
   */
  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      currentTab: index,
      pageNo: 1,
      hasMore: true,
      waybillList: []
    }, () => {
      // 切换标签后加载对应数据
      this.loadCurrentTabData();
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
   * 点击查看查询结果详情（参考 baidacom-wx-1 实现）
   * 标记为最近查询并刷新列表
   */
  async onViewDetail(e) {
    const { waybillCode, companyId } = e.detail;
    console.log('[首页] 点击查询结果:', waybillCode, companyId);

    // 关闭查询结果弹窗
    this.setData({ showResultModal: false });

    // 标记为最近查询
    try {
      await api.markRecentSearch(waybillCode, companyId);
      console.log('[首页] 标记最近查询成功');
    } catch (error) {
      console.log('[首页] 标记最近查询失败:', error);
      // 标记失败不影响后续操作
    }

    // 如果当前在"最近查询"标签页，刷新列表
    if (this.data.currentTab === 0) {
      this.loadRecentSearchList();
    }

    // 跳转到运单详情页
    wx.navigateTo({
      url: `/pages/waybill-detail/waybill-detail?waybillCode=${waybillCode}&companyId=${companyId}`
    });
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
   * 确认登录（点击登录弹窗的确认按钮）
   * 执行微信登录流程
   */
  async onConfirmLogin() {
    // 执行微信登录流程
    await this.dealLogin();
  },

  /**
   * 获取手机号并注册
   * @param {Object} e 事件对象
   */
  async onGetPhoneNumber(e) {
    console.log('[首页] 获取手机号事件:', e);
    
    // 检查是否有code
    if (!e.detail.code) {
      console.log('[首页] 用户取消手机号授权');
      wx.showToast({
        title: '请授权手机号以完成登录',
        icon: 'none'
      });
      return;
    }
    
    // 关闭手机号授权按钮
    this.setData({ showPhoneAuth: false });
    
    // 使用微信手机号授权码进行注册登录
    await this.requestWxRegisterByCodeApi({
      code: e.detail.code,
      nickname: '',
      avatar: ''
    });
  },

  /**
   * 请求后端微信手机号注册接口（参考 baidacom-wx-1 实现）
   * @param {Object} data 注册参数 { openid, code, nickname, avatar }
   */
  async requestWxRegisterByCodeApi(data) {
    console.log('[首页] requestWxRegisterByCodeApi:', data);
    
    try {
      const result = await auth.wxRegisterByCode(data.code, data.nickname, data.avatar);
      console.log('[首页] wxRegisterByCode 响应:', result);
      
      if (result && result.userId) {
        // 注册成功，缓存用户信息
        await auth.setUserInfo(result);
        
        // 存储用户手机号
        if (result.userInfo && result.userInfo.phone) {
          this.setData({ userPhone: result.userInfo.phone });
          wx.setStorageSync('userPhone', result.userInfo.phone);
        }
        
        // 更新登录状态
        this.setData({
          showLoginModal: false,
          showPhoneAuth: false,
          isLoggedIn: true
        });

        // 登录成功后执行查询
        this.onSearch();
      } else {
        wx.showToast({
          title: '获取手机号失败，暂无法注册',
          icon: 'none'
        });
      }
    } catch (error) {
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
   * 点击收藏/订阅按钮（参考 baidacom-wx-1 实现）
   * 订阅需要登录，未登录时提示登录
   */
  async onFavoriteClick(e) {
    const { waybillcode, companyid, subscribeflag } = e.currentTarget.dataset;
    console.log('[首页] 点击收藏:', waybillcode, companyid, subscribeflag);

    // 检查是否已登录
    if (!auth.isLoggedIn()) {
      wx.showToast({
        title: '请先登录后再订阅',
        icon: 'none'
      });
      // 显示登录弹窗
      this.setData({ showLoginModal: true });
      return;
    }

    const isSubscribe = !subscribeflag;

    if (isSubscribe) {
      // 订阅操作 - 先请求订阅消息授权
      this.requestSubscribeMessage(waybillcode, companyid);
    } else {
      // 取消订阅
      this.handleSubscribe(waybillcode, companyid, false);
    }
  },

  /**
   * 请求订阅消息授权（参考 baidacom-wx-1 实现）
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   */
  requestSubscribeMessage(waybillCode, companyId) {
    // 获取订阅模板ID列表
    api.getNotifyTemplateIdList().then(res => {
      const tempIdList = res.data || [];
      
      if (tempIdList.length === 0) {
        // 没有模板ID，直接调用订阅接口
        this.handleSubscribe(waybillCode, companyId, true);
        return;
      }

      wx.requestSubscribeMessage({
        tmplIds: tempIdList,
        success: (res) => {
          console.log('[首页] 订阅消息授权结果:', res);
          let authSuccess = true;
          for (let i = 0; i < tempIdList.length; i++) {
            if (res[tempIdList[i]] !== 'accept') {
              authSuccess = false;
              break;
            }
          }
          
          if (authSuccess) {
            // 授权成功，调用订阅接口
            this.handleSubscribe(waybillCode, companyId, true);
          } else {
            // 用户拒绝订阅
            wx.showToast({
              title: '用户取消订阅，若已设置不再询问，可从右上角进入小程序设置重新开启订阅',
              icon: 'none',
              duration: 3000
            });
          }
        },
        fail: (err) => {
          console.log('[首页] 订阅消息授权失败:', err);
          wx.showToast({
            title: '用户拒绝订阅，若已设置不再询问，可从右上角进入小程序设置重新开启订阅',
            icon: 'none',
            duration: 3000
          });
        }
      });
    }).catch(e => {
      console.log('[首页] 获取模板ID失败:', e);
      // 获取失败，直接调用订阅接口
      this.handleSubscribe(waybillCode, companyId, true);
    });
  },

  /**
   * 处理订阅/取消订阅（参考 baidacom-wx-1 实现）
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   * @param {boolean} isSubscribe 是否订阅
   */
  async handleSubscribe(waybillCode, companyId, isSubscribe) {
    try {
      const res = await api.subscribe(waybillCode, companyId, isSubscribe);
      if (res) {
        wx.showToast({
          title: isSubscribe ? '订阅成功' : '取消订阅成功',
          icon: 'success'
        });
        // 刷新当前列表
        this.loadCurrentTabData();
      } else {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[首页] 订阅操作失败:', error);
      if (error.code === 401) {
        wx.showToast({
          title: '登录失败，无法进行订阅操作',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 加载当前标签页的数据
   */
  loadCurrentTabData() {
    const { currentTab } = this.data;
    this.setData({
      pageNo: 1,
      hasMore: true,
      waybillList: []
    }, () => {
      // 根据当前标签加载对应数据
      switch (currentTab) {
        case 0:
          this.loadRecentSearchList();
          break;
        case 1:
          this.loadSendOrderList();
          break;
        case 2:
          this.loadCollectOrderList();
          break;
      }
    });
  },

  /**
   * 加载最近查询列表（参考 baidacom-wx-1 实现）
   */
  async loadRecentSearchList() {
    this.setData({ loading: true });
    try {
      const res = await api.getRecentSearchPage(this.data.pageNo, this.data.pageSize);
      if (res && res.list) {
        // 格式化日期
        const list = res.list.map(item => {
          return {
            ...item,
            formatDate: this.formatDate(item.waybillCreateTime)
          };
        });
        this.setData({
          waybillList: list,
          hasMore: list.length >= this.data.pageSize
        });
      } else {
        this.setData({ waybillList: [] });
      }
    } catch (error) {
      console.error('[首页] 加载最近查询列表失败:', error);
      // 401错误表示需要登录，静默处理
      if (error.code !== 401) {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
      this.setData({ waybillList: [] });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 格式化日期
   * @param {string} dateStr 日期字符串
   * @returns {string} 格式化后的日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 加载寄件订单列表
   */
  async loadSendOrderList() {
    // TODO: 实现寄件订单列表加载
    this.setData({ waybillList: [] });
  },

  /**
   * 加载收件订单列表
   */
  async loadCollectOrderList() {
    // TODO: 实现收件订单列表加载
    this.setData({ waybillList: [] });
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
