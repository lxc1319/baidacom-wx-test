/**
 * 验证码输入组件
 * 用于输入4位数字验证码，支持自动聚焦和输入完成自动触发验证
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 验证码长度
    codeLength: {
      type: Number,
      value: 4
    },
    // 是否自动聚焦
    autoFocus: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    code: '',           // 验证码值
    codeArray: [],      // 验证码数组（用于显示）
    currentIndex: 0,    // 当前输入位置
    isFocused: false    // 是否聚焦
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 输入事件处理
     * @param {Object} e - 事件对象
     */
    onInput(e) {
      const value = e.detail.value
      
      // 只允许输入数字
      const numericValue = value.replace(/[^\d]/g, '')
      
      // 限制长度
      const code = numericValue.slice(0, this.data.codeLength)
      
      // 转换为数组用于显示
      const codeArray = code.split('')
      
      // 更新数据
      this.setData({
        code: code,
        codeArray: codeArray,
        currentIndex: code.length
      })
      
      // 触发输入变化事件
      this.triggerEvent('change', { value: code })
      
      // 如果输入完成（达到指定长度），触发完成事件
      if (code.length === this.data.codeLength) {
        this.triggerEvent('complete', { value: code })
      }
    },

    /**
     * 失去焦点事件
     */
    onBlur() {
      this.setData({
        isFocused: false
      })
    },

    /**
     * 获得焦点事件
     */
    onFocus() {
      this.setData({
        isFocused: true
      })
    },

    /**
     * 点击验证码框
     * 触发输入框聚焦
     */
    onBoxClick() {
      this.setData({
        autoFocus: true,
        isFocused: true
      })
    },

    /**
     * 清空验证码
     * 供外部调用
     */
    clear() {
      this.setData({
        code: '',
        codeArray: [],
        currentIndex: 0
      })
    },

    /**
     * 获取验证码值
     * 供外部调用
     */
    getValue() {
      return this.data.code
    }
  }
})
