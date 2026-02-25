// waybill-result-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
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
     * 关闭弹窗
     */
    onClose() {
      this.triggerEvent('close');
    },

    /**
     * 查看运单详情
     * @param {Object} e 事件对象
     */
    onViewDetail(e) {
      const item = e.currentTarget.dataset.item;
      this.triggerEvent('viewdetail', {
        waybillCode: item.waybillCode,
        companyId: item.companyId
      });
    },

    /**
     * 格式化日期
     * @param {string} dateStr 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(dateStr) {
      if (!dateStr) return '未知';
      try {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      } catch (error) {
        return '未知时间';
      }
    }
  }
});