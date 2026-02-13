/**
 * 加载组件
 * 用于展示加载状态，支持全屏和局部加载两种模式
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示加载
    visible: {
      type: Boolean,
      value: false
    },
    // 加载文字
    text: {
      type: String,
      value: '加载中...'
    },
    // 是否全屏显示
    fullscreen: {
      type: Boolean,
      value: false
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
  }
})
