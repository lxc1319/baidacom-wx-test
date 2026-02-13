/**
 * 物流公司详情页
 * 展示物流公司的详细信息，包括轮播图、品牌简介、网点查询、线路查询、消息通知和联系我们
 */

const api = require('../../services/api.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    companyId: 0,                    // 公司ID
    companyInfo: null,               // 公司信息
    banners: [],                     // 轮播图列表
    noticeList: [],                  // 通知公告列表
    routes: [],                      // 线路列表
    branches: [],                    // 网点列表（从线路中提取）
    filteredBranches: [],            // 筛选后的网点列表
    filteredRoutes: [],              // 筛选后的线路列表
    
    // 标签页相关
    currentTab: 0,                   // 当前选中的标签页 0-品牌介绍 1-网点查询 2-线路查询 3-联系我们
    tabList: ['品牌介绍', '网点查询', '线路查询', '联系我们'],
    
    // 网点查询相关
    searchKeyword: '',               // 网点搜索关键词
    
    // 线路查询相关
    loadCity: '',                    // 始发城镇
    discCity: '',                    // 到达城镇
    loadCities: [],                  // 所有始发城镇列表
    discCities: [],                  // 所有到达城镇列表
    filteredLoadCities: [],          // 筛选后的始发城镇列表
    filteredDiscCities: [],          // 筛选后的到达城镇列表
    showLoadCityDropdown: false,     // 是否显示始发城镇下拉列表
    showDiscCityDropdown: false,     // 是否显示到达城镇下拉列表
    
    // 消息通知相关
    messageList: [],                 // 消息列表
    messagePageNo: 1,                // 消息页码
    messagePageSize: 10,             // 消息每页数量
    messageHasMore: true,            // 是否还有更多消息
    
    // 运单查询相关
    waybillCode: '',                 // 运单号
    
    // 联系我们相关（接口暂未实现，暂时使用companyInfo）
    // companyContacts: null,           // 联系人信息（优先从独立接口获取）
    // useCompanyInfoForContact: false, // 是否使用companyInfo作为联系人数据源
    
    // 加载状态
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const companyId = parseInt(options.companyId)
    
    if (!companyId) {
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.setData({ companyId })
    
    // 加载页面数据
    this.loadPageData()
  },

  /**
   * 加载页面数据
   */
  async loadPageData() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      // 先加载公司信息（必须加载）
      await this.loadCompanyInfo()
      
      // 并行加载其他数据（非必须，失败不影响主流程）
      await Promise.allSettled([
        this.loadBanners(),
        this.loadLatestNotice(),
        this.loadRoutes()
        // this.loadCompanyContacts() // 接口暂未实现，暂时注释
      ])
      
      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      console.error('加载页面数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 加载公司信息
   */
  async loadCompanyInfo() {
    try {
      // 先尝试调用 get-by-id 接口
      const companyInfo = await api.getCompanyById(this.data.companyId)
      console.log('查询电话:', companyInfo.corporationPhone)
      this.setData({ companyInfo })
      
      // 设置导航栏标题为 shortName
      if (companyInfo.shortName) {
        wx.setNavigationBarTitle({
          title: companyInfo.shortName
        })
      }
    } catch (error) {
      console.log('get-by-id 接口失败，尝试从公司列表获取')

      try {
        // 如果权限不足，从公司列表中获取
        const list = await api.getInnerCompanyList()
        const company = list.find(item => item.id === this.data.companyId)

        if (company) {
          this.setData({ companyInfo: company })
          
          // 设置导航栏标题为 shortName
          if (company.shortName) {
            wx.setNavigationBarTitle({
              title: company.shortName
            })
          }
        } else {
          throw new Error('未找到公司信息')
        }
      } catch (err) {
        // 401错误表示需要登录，静默处理
        if (err.code === 401) {
          console.log('公司信息需要登录才能查看')
          this.setData({ companyInfo: null })
          return
        }
        console.error('加载公司信息失败:', err)
        throw err
      }
    }
  },

  /**
   * 加载轮播图
   */
  async loadBanners() {
    try {
      const banners = await api.getCompanyAdBannerList({
        companyId: this.data.companyId
      })

      // 按 sortNum 排序
      const sortedBanners = banners.sort((a, b) => a.sortNum - b.sortNum)

      this.setData({ banners: sortedBanners })
    } catch (error) {
      // 401错误表示需要登录，静默处理
      if (error.code === 401) {
        console.log('轮播图需要登录才能查看')
        this.setData({ banners: [] })
        return
      }
      console.error('加载轮播图失败', error)
      // 轮播图加载失败不影响主流程
    }
  },

  /**
   * 加载通知公告列表
   */
  async loadLatestNotice() {
    try {
      const result = await api.getComCompanyNoticePage({
        companyId: this.data.companyId,
        pageNo: 1,
        pageSize: 5
      })

      if (result.list && result.list.length > 0) {
        this.setData({ noticeList: result.list })
      } else {
        // 没有数据时，设置 noticeList 为空数组
        this.setData({ noticeList: [] })
      }
    } catch (error) {
      // 401错误表示需要登录，静默处理
      if (error.code === 401) {
        console.log('通知公告需要登录才能查看')
        this.setData({ noticeList: [] })
        return
      }
      console.error('加载通知公告失败:', error)
      // 通知公告加载失败不影响主流程
      this.setData({ noticeList: [] })
    }
  },

  /**
   * 加载公司联系人信息
   * 优先从独立接口获取，失败则使用companyInfo的数据
   * 接口暂未实现，暂时注释
   */
  // async loadCompanyContacts() {
  //   try {
  //     const result = await api.getCompanyContacts(this.data.companyId)
  //     console.log('联系人接口返回', result)
  //     
  //     if (result && result.length > 0) {
  //       // 找到主联系人（type === 0）
  //       const mainContact = result.find(item => item.type === 0)
  //       if (mainContact) {
  //         this.setData({
  //           companyContacts: mainContact,
  //           useCompanyInfoForContact: false
  //         })
  //         return
  //       }
  //     }
  //     // 接口返回空数据，使用companyInfo
  //     this.setData({ useCompanyInfoForContact: true })
  //   } catch (error) {
  //     console.error('加载联系人信息失败:', error)
  //     this.setData({ useCompanyInfoForContact: true })
  //   }
  // },

  /**
   * 获取字典标签
   * @param {string} dictType - 字典类型
   * @param {number} value - 字典值
   * @returns {string} 字典标签
   */
  getDictLabel(dictType, value) {
    const strValue = String(value)
    
    // 线路类型映射
    const lineTypeMap = {
      '1': '直达',
      '2': '中转'
    }
    
    // 线路时效映射
    const lineValidityMap = {
      '1': '当日达',
      '2': '次日达',
      '3': '隔日达',
      '4': '三日达',
      '5': '四日达',
      '6': '五日达',
      '7': '六日达',
      '8': '七日达'
    }
    
    // 增值服务映射
    const routeServicesMap = {
      '1': '保价运输',
      '2': '送货上门',
      '3': '代收货款'
    }

    if (dictType === 'COM_LINE_TYPE') {
      return lineTypeMap[strValue] || ''
    } else if (dictType === 'COM_LINE_VALIDITY') {
      return lineValidityMap[strValue] || ''
    } else if (dictType === 'COM_ROUTE_SERVICES') {
      return routeServicesMap[strValue] || ''
    }
    return strValue || ''
  },

  /**
   * 加载线路信息（同时提取网点信息）
   */
  async loadRoutes() {
    try {
      const result = await api.getRouteInfoPage({
        companyId: this.data.companyId,
        pageNo: 1,
        pageSize: 100
      })
      
      // 从线路的 loadBranch 和 discBranch 中提取所有网点（去重，按名称去重）
      const branches = []
      const branchMap = new Map() // 用于去重
      const loadCitiesSet = new Set()
      const discCitiesSet = new Set()

      // 处理线路数据，转换字典值
      result.list.forEach(route => {
        console.log('线路数据:', route.branchRouteName, 'lineType:', route.lineType, 'lineValidity:', route.lineValidity)
        // 处理线路类型
        if (route.lineType) {
          route.lineTypeLabel = this.getDictLabel('COM_LINE_TYPE', route.lineType)
          console.log('lineType转换:', route.lineType, '->', route.lineTypeLabel)
        }
        // 处理线路时效
        if (route.lineValidity) {
          route.lineValidityLabel = this.getDictLabel('COM_LINE_VALIDITY', route.lineValidity)
          console.log('lineValidity转换:', route.lineValidity, '->', route.lineValidityLabel)
        } else {
          // 如果 lineValidity 为 null，默认显示"线路"
          route.lineValidityLabel = '线路'
        }
        // 处理增值服务
        if (route.routeServices) {
          route.routeServicesLabel = this.getDictLabel('COM_ROUTE_SERVICES', route.routeServices)
        }

        // 提取始发站点（loadBranch）
        if (route.loadBranch) {
          const key = route.loadBranch.branchName // 使用网点名称作为去重key
          if (!branchMap.has(key)) {
            const branch = {
              id: route.loadBranch.id,
              branchName: route.loadBranch.branchName || '',
              branchMobile: route.loadBranch.branchMobile || route.loadBranch.branchPhone || '',
              branchAddress: route.loadBranch.branchAddress || '',
              contactName: route.loadBranch.contactName || ''
            }
            branchMap.set(key, branch)
            branches.push(branch)
          }
        }

        // 提取到达站点（discBranch）
        if (route.discBranch) {
          const key = route.discBranch.branchName // 使用网点名称作为去重key
          if (!branchMap.has(key)) {
            const branch = {
              id: route.discBranch.id,
              branchName: route.discBranch.branchName || '',
              branchMobile: route.discBranch.branchMobile || route.discBranch.branchPhone || '',
              branchAddress: route.discBranch.branchAddress || '',
              contactName: route.discBranch.contactName || ''
            }
            branchMap.set(key, branch)
            branches.push(branch)
          }
        } else if (route.discDeptName) {
          // 如果 discBranch 为 null 但有 discDeptName，创建简单的网点对象
          const key = route.discDeptName
          if (!branchMap.has(key)) {
            const branch = {
              id: route.discDeptId || '',
              branchName: route.discDeptName,
              branchMobile: '',
              branchAddress: '',
              contactName: ''
            }
            branchMap.set(key, branch)
            branches.push(branch)
          }
        }

        // 提取城镇列表
        if (route.loadDeptName) {
          loadCitiesSet.add(route.loadDeptName)
        }
        if (route.discDeptName) {
          discCitiesSet.add(route.discDeptName)
        }
      })
      
      const loadCities = Array.from(loadCitiesSet).sort()
      const discCities = Array.from(discCitiesSet).sort()
      
      this.setData({
        routes: result.list,
        filteredRoutes: result.list,
        branches: branches,
        filteredBranches: branches,
        loadCities: loadCities,
        discCities: discCities
      })
    } catch (error) {
      // 401错误表示需要登录，静默处理
      if (error.code === 401) {
        console.log('线路信息需要登录才能查看')
        this.setData({
          routes: [],
          filteredRoutes: [],
          branches: [],
          filteredBranches: [],
          loadCities: [],
          discCities: []
        })
        return
      }
      console.error('加载线路信息失败:', error)
      // 线路信息加载失败不影响主流程
    }
  },

  /**
   * 切换标签页
   */
  onTabChange(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentTab: index })
  },

  /**
   * 轮播图点击事件
   */
  onBannerClick(e) {
    // 公司详情页轮播图不执行任何跳转操作
    console.log('轮播图点击，不执行跳转')
  },

  /**
   * 点击语音播报区域
   */
  onNoticeClick() {
    // 跳转到通知公告列表页
    wx.navigateTo({
      url: `/pages/notice-list/notice-list?companyId=${this.data.companyId}`
    })
  },

  /**
   * 运单查询输入
   */
  onWaybillInput(e) {
    this.setData({
      waybillCode: e.detail.value
    })
  },

  /**
   * 清除输入
   */
  onClearInput() {
    this.setData({
      waybillCode: ''
    })
  },

  /**
   * 扫码查询
   */
  async onScanCode() {
    try {
      const res = await wx.scanCode({
        onlyFromCamera: false,
        scanType: ['barCode', 'qrCode']
      })
      
      if (res.result) {
        this.setData({ waybillCode: res.result })
        // 自动执行查询
        this.onSearchWaybill()
      }
    } catch (error) {
      if (error.errMsg !== 'scanCode:fail cancel') {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      }
    }
  },

  /**
   * 查询运单
   */
  async onSearchWaybill() {
    const waybillCode = this.data.waybillCode.trim()
    
    if (!waybillCode) {
      wx.showToast({
        title: '请输入运单号',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({ title: '查询中...' })
      
      // 查询指定公司的运单
      const result = await api.searchWaybillByCompany(waybillCode, this.data.companyId)
      
      wx.hideLoading()
      
      if (result) {
        // 跳转到运单身份验证页
        wx.navigateTo({
          url: `/pages/waybill-verify/waybill-verify?waybillCode=${waybillCode}&companyId=${this.data.companyId}`
        })
      } else {
        wx.showToast({
          title: '未找到运单',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('查询运单失败:', error)
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      })
    }
  },

  /**
   * ==================== 网点查询相关方法 ====================
   */

  /**
   * 网点搜索输入
   */
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    this.filterBranches(keyword)
  },

  /**
   * 筛选网点
   */
  filterBranches(keyword) {
    if (!keyword) {
      // 搜索框为空，显示所有网点
      this.setData({ filteredBranches: this.data.branches })
      return
    }
    
    // 根据关键词筛选网点（匹配网点名称或地址）
    const filtered = this.data.branches.filter(branch => {
      return branch.branchName.includes(keyword) || 
             branch.branchAddress.includes(keyword)
    })
    
    this.setData({ filteredBranches: filtered })
  },

  /**
   * 清除搜索
   */
  onClearSearch() {
    this.setData({
      searchKeyword: '',
      filteredBranches: this.data.branches
    })
  },

  /**
   * 拨打电话
   */
  onCallPhone(e) {
    const phone = e.currentTarget.dataset.phone
    
    if (!phone) {
      wx.showToast({
        title: '电话号码为空',
        icon: 'none'
      })
      return
    }
    
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  /**
   * 打开地图导航
   */
  onOpenLocation(e) {
    const branch = e.currentTarget.dataset.branch
    
    if (!branch) return
    
    // 使用后端返回的经纬度信息（xLong, yLati）
    const latitude = parseFloat(branch.yLati) || 0
    const longitude = parseFloat(branch.xLong) || 0
    
    if (latitude === 0 || longitude === 0) {
      wx.showToast({
        title: '该网点暂无位置信息',
        icon: 'none'
      })
      return
    }
    
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: branch.branchName,
      address: branch.branchAddress,
      scale: 15
    })
  },

  /**
   * ==================== 线路查询相关方法 ====================
   */

  /**
   * 始发城镇输入
   */
  onLoadCityInput(e) {
    const loadCity = e.detail.value
    this.setData({ loadCity })
    
    // 筛选匹配的城镇
    if (loadCity) {
      const filtered = this.data.loadCities.filter(city => 
        city.includes(loadCity)
      )
      this.setData({ 
        filteredLoadCities: filtered,
        showLoadCityDropdown: true
      })
    } else {
      this.setData({ 
        filteredLoadCities: [],
        showLoadCityDropdown: false
      })
    }
    
    // 筛选线路
    this.filterRoutes(loadCity, this.data.discCity)
  },

  /**
   * 到达城镇输入
   */
  onDiscCityInput(e) {
    const discCity = e.detail.value
    this.setData({ discCity })
    
    // 筛选匹配的城镇
    if (discCity) {
      const filtered = this.data.discCities.filter(city => 
        city.includes(discCity)
      )
      this.setData({ 
        filteredDiscCities: filtered,
        showDiscCityDropdown: true
      })
    } else {
      this.setData({ 
        filteredDiscCities: [],
        showDiscCityDropdown: false
      })
    }
    
    // 筛选线路
    this.filterRoutes(this.data.loadCity, discCity)
  },

  /**
   * 始发城镇输入框获得焦点
   */
  onLoadCityFocus() {
    if (this.data.loadCity && this.data.filteredLoadCities.length > 0) {
      this.setData({ showLoadCityDropdown: true })
    }
  },

  /**
   * 始发城镇输入框失去焦点
   */
  onLoadCityBlur() {
    // 延迟隐藏，以便点击下拉列表项
    setTimeout(() => {
      this.setData({ showLoadCityDropdown: false })
    }, 200)
  },

  /**
   * 到达城镇输入框获得焦点
   */
  onDiscCityFocus() {
    if (this.data.discCity && this.data.filteredDiscCities.length > 0) {
      this.setData({ showDiscCityDropdown: true })
    }
  },

  /**
   * 到达城镇输入框失去焦点
   */
  onDiscCityBlur() {
    // 延迟隐藏，以便点击下拉列表项
    setTimeout(() => {
      this.setData({ showDiscCityDropdown: false })
    }, 200)
  },

  /**
   * 选择始发城镇
   */
  onSelectLoadCity(e) {
    const city = e.currentTarget.dataset.city
    this.setData({ 
      loadCity: city,
      showLoadCityDropdown: false
    })
    this.filterRoutes(city, this.data.discCity)
  },

  /**
   * 选择到达城镇
   */
  onSelectDiscCity(e) {
    const city = e.currentTarget.dataset.city
    this.setData({ 
      discCity: city,
      showDiscCityDropdown: false
    })
    this.filterRoutes(this.data.loadCity, city)
  },

  /**
   * 清除始发城镇
   */
  onClearLoadCity() {
    this.setData({
      loadCity: '',
      showLoadCityDropdown: false
    })
    this.filterRoutes('', this.data.discCity)
  },

  /**
   * 清除到达城镇
   */
  onClearDiscCity() {
    this.setData({
      discCity: '',
      showDiscCityDropdown: false
    })
    this.filterRoutes(this.data.loadCity, '')
  },

  /**
   * 筛选线路
   */
  filterRoutes(loadCity, discCity) {
    if (!loadCity && !discCity) {
      // 两个输入框都为空，显示所有线路
      this.setData({ filteredRoutes: this.data.routes })
      return
    }
    
    // 根据条件筛选线路
    const filtered = this.data.routes.filter(route => {
      const matchLoad = !loadCity || route.loadDeptName.includes(loadCity)
      const matchDisc = !discCity || route.discDeptName.includes(discCity)
      return matchLoad && matchDisc
    })
    
    this.setData({ filteredRoutes: filtered })
  },

  /**
   * ==================== 消息通知相关方法 ====================
   */

  /**
   * 加载消息列表
   */
  async loadMessageList() {
    try {
      wx.showLoading({ title: '加载中...' })
      
      const result = await api.getMyNotifyMessagePage(
        this.data.messagePageNo,
        this.data.messagePageSize
      )
      
      wx.hideLoading()
      
      const newList = this.data.messagePageNo === 1 
        ? result.list 
        : [...this.data.messageList, ...result.list]
      
      this.setData({
        messageList: newList,
        messageHasMore: result.list.length >= this.data.messagePageSize
      })
    } catch (error) {
      wx.hideLoading()
      console.error('加载消息列表失败:', error)
      
      // 如果是未登录错误，显示提示
      if (error.code === 401) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    }
  },

  /**
   * 阅读消息详情
   */
  onReadMessage(e) {
    const message = e.currentTarget.dataset.message
    
    // 跳转到消息详情页
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${message.id}&data=${encodeURIComponent(JSON.stringify(message))}&type=message`
    })
  },

  /**
   * ==================== 联系我们相关方法 ====================
   */

  /**
   * 打开公司地图
   */
  onOpenCompanyMap() {
    const { companyInfo } = this.data
    
    if (!companyInfo || !companyInfo.address) {
      wx.showToast({
        title: '暂无地址信息',
        icon: 'none'
      })
      return
    }
    
    // 注意：实际使用时需要将地址转换为经纬度
    // 这里使用地址搜索功能
    wx.openLocation({
      latitude: 0,  // 需要通过地址解析获取
      longitude: 0,  // 需要通过地址解析获取
      name: companyInfo.name,
      address: companyInfo.address,
      scale: 15
    })
  },

  /**
   * 复制网址
   */
  onCopyUrl() {
    const { companyInfo } = this.data
    
    if (!companyInfo || !companyInfo.organizationUrl) {
      wx.showToast({
        title: '暂无网址信息',
        icon: 'none'
      })
      return
    }
    
    wx.setClipboardData({
      data: companyInfo.organizationUrl,
      success: () => {
        wx.showToast({
          title: '网址已复制',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 复制邮箱
   */
  onCopyEmail() {
    const { companyInfo } = this.data
    
    if (!companyInfo || !companyInfo.organizationEmail) {
      wx.showToast({
        title: '暂无邮箱信息',
        icon: 'none'
      })
      return
    }
    
    wx.setClipboardData({
      data: companyInfo.organizationEmail,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadPageData()
    wx.stopPullDownRefresh()
  }
})
