/**
 * 轮播图组件
 * 用于展示物流公司的宣传图片
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    banners: {
      type: Array,
      value: []
    },
    autoplay: {
      type: Boolean,
      value: true
    },
    interval: {
      type: Number,
      value: 4000
    },
    duration: {
      type: Number,
      value: 500
    },
    circular: {
      type: Boolean,
      value: true
    },
    indicatorType: {
      type: String,
      value: 'bar'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSwiperChange(e) {
      this.setData({
        currentIndex: e.detail.current
      })
    },

    onBannerClick(e) {
      const banner = e.currentTarget.dataset.banner
      this.triggerEvent('bannerClick', { banner })
    },

    onImageError() {
      // 图片加载失败处理
    }
  }
})
