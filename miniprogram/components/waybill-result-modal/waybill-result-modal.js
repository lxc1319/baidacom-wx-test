/**
 * 查询结果弹窗组件
 * 用于展示运单查询结果，以表格形式显示关键信息
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示弹窗
    visible: {
      type: Boolean,
      value: false
    },
    // 运单数据列表
    results: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击遮罩层
     * 关闭弹窗
     */
    onMaskClick() {
      this.triggerEvent('close')
    },

    /**
     * 点击查看详情
     * 跳转到运单身份验证页
     */
    onViewDetail(e) {
      const item = e.currentTarget.dataset.item

      if (!item || !item.waybillCode) {
        wx.showToast({
          title: '运单信息不完整',
          icon: 'none'
        })
        return
      }

      // 触发查看详情事件
      this.triggerEvent('viewdetail', {
        waybillCode: item.waybillCode,
        companyId: item.companyId
      })
    },

    /**
     * 点击取消按钮
     * 关闭弹窗
     */
    onCancel() {
      this.triggerEvent('close')
    }
  }
})
