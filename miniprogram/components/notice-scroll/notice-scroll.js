/**
 * 滚动通知组件（跑马灯）
 * 用于展示通知公告，支持垂直滚动和点击跳转
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 通知列表
    noticeList: {
      type: Array,
      value: []
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      value: true
    },
    // 自动切换时间间隔（毫秒）
    interval: {
      type: Number,
      value: 3000
    },
    // 滑动动画时长（毫秒）
    duration: {
      type: Number,
      value: 500
    },
    // 是否循环播放
    circular: {
      type: Boolean,
      value: true
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
     * 点击通知
     * 触发父组件的点击事件
     */
    onNoticeClick() {
      this.triggerEvent('click')
    }
  }
})
