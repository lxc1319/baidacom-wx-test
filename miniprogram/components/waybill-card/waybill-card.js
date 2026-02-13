/**
 * 运单卡片组件
 * 用于在运单列表中展示运单的关键信息，并提供收藏/订阅功能
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 运单数据
    waybillData: {
      type: Object,
      value: {},
      observer: function(newVal) {
        // 当运单数据变化时，更新显示字段
        this.updateDisplayFields(newVal)
      }
    },
    // 显示类型：recent-最近查询, send-寄件订单, collect-收件订单
    displayType: {
      type: String,
      value: 'recent'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    displayName: '',      // 显示的姓名
    displayAddress: '',   // 显示的地址
    displayDate: ''       // 显示的日期
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 更新显示字段
     * 根据显示类型决定显示寄件人还是收件人信息
     */
    updateDisplayFields(waybillData) {
      if (!waybillData) return

      let displayName = ''
      let displayAddress = ''
      let displayDate = ''

      // 根据显示类型决定显示内容
      switch (this.data.displayType) {
        case 'send':
          // 寄件订单：显示收件人信息
          displayName = waybillData.collectName || ''
          displayAddress = waybillData.collectAddress || ''
          break
        case 'collect':
          // 收件订单：显示寄件人信息
          displayName = waybillData.sendName || ''
          displayAddress = waybillData.sendAddress || ''
          break
        case 'recent':
        default:
          // 最近查询：显示收件人信息
          displayName = waybillData.collectName || ''
          displayAddress = waybillData.collectAddress || waybillData.orderStatusDesc || ''
          break
      }

      // 格式化日期
      displayDate = this.formatDate(waybillData.waybillCreateTime || waybillData.createTime)

      this.setData({
        displayName,
        displayAddress,
        displayDate
      })
    },

    /**
     * 格式化日期
     * 将完整日期时间格式化为 YYYY-MM-DD
     */
    formatDate(dateStr) {
      if (!dateStr) return ''
      
      // 如果已经是 YYYY-MM-DD 格式，直接返回
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
      
      // 如果是完整的日期时间格式，提取日期部分
      if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0]
      }
      
      return dateStr
    },

    /**
     * 点击卡片
     * 跳转到运单身份验证页
     */
    onCardClick() {
      const { waybillData } = this.data
      
      if (!waybillData || !waybillData.waybillCode) {
        wx.showToast({
          title: '运单信息不完整',
          icon: 'none'
        })
        return
      }

      // 触发父组件的点击事件
      this.triggerEvent('cardclick', {
        waybillCode: waybillData.waybillCode,
        companyId: waybillData.companyId
      })
    },

    /**
     * 点击收藏图标
     * 切换订阅状态
     */
    onFavoriteClick(e) {
      // 阻止事件冒泡，避免触发卡片点击
      e.stopPropagation()
      
      const { waybillData } = this.data
      
      if (!waybillData || !waybillData.waybillCode) {
        wx.showToast({
          title: '运单信息不完整',
          icon: 'none'
        })
        return
      }

      // 触发父组件的订阅事件
      this.triggerEvent('subscribe', {
        waybillCode: waybillData.waybillCode,
        companyId: waybillData.companyId,
        isSubscribed: waybillData.subscribeFlag || false
      })
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件初始化时更新显示字段
      this.updateDisplayFields(this.data.waybillData)
    }
  }
})
