/**
 * 条形码展示组件
 * 用于生成和展示运单号的条形码
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 条形码内容（运单号）
    code: {
      type: String,
      value: '',
      observer: function(newVal) {
        if (newVal) {
          this.drawBarcode(newVal)
        }
      }
    },
    // 条形码宽度（rpx）
    width: {
      type: Number,
      value: 600
    },
    // 条形码高度（rpx）
    height: {
      type: Number,
      value: 200
    },
    // 是否显示提示
    showTip: {
      type: Boolean,
      value: true
    },
    // 是否显示条形码文字
    showCode: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    canvasWidth: 300,
    canvasHeight: 100
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 绘制条形码
     * 使用 Code 128 编码绘制标准条形码
     * @param {String} code - 条形码内容
     */
    drawBarcode(code) {
      if (!code) return

      // 将rpx转换为px
      const systemInfo = wx.getSystemInfoSync()
      const pixelRatio = systemInfo.windowWidth / 750
      const canvasWidth = this.data.width * pixelRatio
      const canvasHeight = this.data.height * pixelRatio

      this.setData({
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight
      })

      // 获取canvas上下文
      const ctx = wx.createCanvasContext('barcodeCanvas', this)

      // 清空画布
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // 设置背景色
      ctx.setFillStyle('#FFFFFF')
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Code 128 编码表（简化版，使用模式B）
      const code128Patterns = this.getCode128Patterns()
      
      // 构建编码序列
      let encoded = ''
      // 起始符 (Start B)
      encoded += code128Patterns[104]
      // 校验和计算
      let checksum = 104
      // 编码数据
      for (let i = 0; i < code.length; i++) {
        const char = code.charAt(i)
        const value = this.charToValue(char)
        encoded += code128Patterns[value]
        checksum += value * (i + 1)
      }
      // 校验符
      checksum = checksum % 103
      encoded += code128Patterns[checksum]
      // 终止符
      encoded += code128Patterns[106]

      // 绘制条形码
      const moduleWidth = canvasWidth / encoded.length
      const barHeight = canvasHeight * 0.85
      const startY = (canvasHeight - barHeight) / 2

      let x = 0
      for (let i = 0; i < encoded.length; i++) {
        const module = encoded.charAt(i)
        if (module === '1') {
          ctx.setFillStyle('#000000')
          ctx.fillRect(x, startY, moduleWidth + 0.5, barHeight)
        }
        x += moduleWidth
      }

      // 绘制
      ctx.draw()
    },

    /**
     * 获取 Code 128 编码模式
     * @returns {Array} 编码模式数组
     */
    getCode128Patterns() {
      // Code 128 编码模式 (0=空格, 1=黑条)
      // 每个字符由11个模块组成，格式为：黑条-白条-黑条-白条-黑条-白条
      return [
        '11011001100', // 0: 空格
        '11001101100', // 1: !
        '11001100110', // 2: "
        '10010011000', // 3: #
        '10010001100', // 4: $
        '10001001100', // 5: %
        '10011001000', // 6: &
        '10011000100', // 7: '
        '10001100100', // 8: (
        '11001001000', // 9: )
        '11001000100', // 10: *
        '11000100100', // 11: +
        '10110011100', // 12: ,
        '10011011100', // 13: -
        '10011001110', // 14: .
        '10111001100', // 15: /
        '10011101100', // 16: 0
        '10011100110', // 17: 1
        '11001110010', // 18: 2
        '11001011100', // 19: 3
        '11001001110', // 20: 4
        '11011100100', // 21: 5
        '11001110100', // 22: 6
        '11101101110', // 23: 7
        '11101001100', // 24: 8
        '11100101100', // 25: 9
        '11100100110', // 26: :
        '11101100100', // 27: ;
        '11100110100', // 28: <
        '11100110010', // 29: =
        '11011011000', // 30: >
        '11011000110', // 31: ?
        '11000110110', // 32: @
        '10100011000', // 33: A
        '10001011000', // 34: B
        '10001000110', // 35: C
        '10110001000', // 36: D
        '10001101000', // 37: E
        '10001100010', // 38: F
        '11010001000', // 39: G
        '11000101000', // 40: H
        '11000100010', // 41: I
        '10110111000', // 42: J
        '10110001110', // 43: K
        '10001101110', // 44: L
        '10111011000', // 45: M
        '10111000110', // 46: N
        '10001110110', // 47: O
        '11101110110', // 48: P
        '11010001110', // 49: Q
        '11000101110', // 50: R
        '11011101000', // 51: S
        '11011100010', // 52: T
        '11011101110', // 53: U
        '11101011000', // 54: V
        '11101000110', // 55: W
        '11100010110', // 56: X
        '11101101000', // 57: Y
        '11101100010', // 58: Z
        '11100011010', // 59: [
        '11101111010', // 60: \
        '11001000010', // 61: ]
        '11110001010', // 62: ^
        '10100110000', // 63: _
        '10100001100', // 64: `
        '10010110000', // 65: a
        '10010000110', // 66: b
        '10000101100', // 67: c
        '10000100110', // 68: d
        '10110010000', // 69: e
        '10110000100', // 70: f
        '10011010000', // 71: g
        '10011000010', // 72: h
        '10000110100', // 73: i
        '10000110010', // 74: j
        '11000010010', // 75: k
        '11001010000', // 76: l
        '11110111010', // 77: m
        '11000010100', // 78: n
        '10001111010', // 79: o
        '10100111100', // 80: p
        '10010111100', // 81: q
        '10010011110', // 82: r
        '10111100100', // 83: s
        '10011110100', // 84: t
        '10011110010', // 85: u
        '11110100100', // 86: v
        '11110010100', // 87: w
        '11110010010', // 88: x
        '11011011110', // 89: y
        '11011110110', // 90: z
        '11110110110', // 91: {
        '10101111000', // 92: |
        '10100011110', // 93: }
        '10001011110', // 94: ~
        '10111101000', // 95: DEL
        '10111100010', // 96: FNC3
        '11110101000', // 97: FNC2
        '11110100010', // 98: Shift B
        '10111011110', // 99: Code C
        '10111101110', // 100: Code B
        '11101011110', // 101: Code A
        '11110101110', // 102: FNC1
        '11010000100', // 103: Start A
        '11010010000', // 104: Start B
        '11010011100', // 105: Start C
        '11000111010'  // 106: Stop
      ]
    },

    /**
     * 字符转换为 Code 128 值
     * @param {String} char - 字符
     * @returns {Number} Code 128 值
     */
    charToValue(char) {
      const code = char.charCodeAt(0)
      // 空格 (32) -> 0
      if (code === 32) return 0
      // ! (33) ~ _ (95) -> 1-63
      if (code >= 33 && code <= 95) return code - 32
      // ` (96) ~ DEL (127) -> 64-95
      if (code >= 96 && code <= 127) return code - 32
      // 默认返回空格
      return 0
    },

    /**
     * 长按保存条形码
     * 将canvas内容保存为图片
     */
    saveBarcode() {
      const that = this
      wx.canvasToTempFilePath({
        canvasId: 'barcodeCanvas',
        success: function(res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function() {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
            },
            fail: function() {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        }
      }, this)
    }
  }
})
