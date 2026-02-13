/**
 * 空状态组件
 * 用于展示空数据状态，支持自定义图标、文字和操作按钮
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图标（emoji或图标字符）
    icon: {
      type: String,
      value: '📦'
    },
    // 提示文字
    text: {
      type: String,
      value: '暂无数据'
    },
    // 描述文字
    description: {
      type: String,
      value: ''
    },
    // 按钮文字
    buttonText: {
      type: String,
      value: ''
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
     * 点击按钮
     * 触发父组件的按钮点击事件
     */
    onButtonClick() {
      this.triggerEvent('buttonclick')
    }
  }
})
