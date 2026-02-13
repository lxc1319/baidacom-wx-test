/**
 * 数据格式化工具
 * 提供常用的数据格式化方法
 */

/**
 * 格式化工具类
 */
class Formatter {
  /**
   * 格式化日期时间
   * @param {string|Date} date 日期
   * @param {string} format 格式（默认：YYYY-MM-DD HH:mm:ss）
   * @returns {string} 格式化后的日期字符串
   */
  static formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return ''
    
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    const second = String(d.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second)
  }

  /**
   * 格式化日期
   * @param {string|Date} date 日期
   * @returns {string} 格式化后的日期字符串（YYYY-MM-DD）
   */
  static formatDate(date) {
    return this.formatDateTime(date, 'YYYY-MM-DD')
  }

  /**
   * 格式化时间
   * @param {string|Date} date 日期
   * @returns {string} 格式化后的时间字符串（HH:mm:ss）
   */
  static formatTime(date) {
    return this.formatDateTime(date, 'HH:mm:ss')
  }

  /**
   * 格式化金额（保留两位小数）
   * @param {number} amount 金额
   * @param {string} unit 单位（默认：元）
   * @returns {string} 格式化后的金额字符串
   */
  static formatAmount(amount, unit = '元') {
    if (amount === null || amount === undefined) return '0.00' + unit
    const num = Number(amount)
    if (isNaN(num)) return '0.00' + unit
    return num.toFixed(2) + unit
  }

  /**
   * 格式化数字（千分位分隔）
   * @param {number} num 数字
   * @returns {string} 格式化后的数字字符串
   */
  static formatNumber(num) {
    if (num === null || num === undefined) return '0'
    const n = Number(num)
    if (isNaN(n)) return '0'
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  /**
   * 格式化重量（保留两位小数）
   * @param {number} weight 重量（单位：千克）
   * @returns {string} 格式化后的重量字符串
   */
  static formatWeight(weight) {
    if (weight === null || weight === undefined) return '0.00kg'
    const num = Number(weight)
    if (isNaN(num)) return '0.00kg'
    return num.toFixed(2) + 'kg'
  }

  /**
   * 格式化体积（保留两位小数）
   * @param {number} volume 体积（单位：立方米）
   * @returns {string} 格式化后的体积字符串
   */
  static formatVolume(volume) {
    if (volume === null || volume === undefined) return '0.00m³'
    const num = Number(volume)
    if (isNaN(num)) return '0.00m³'
    return num.toFixed(2) + 'm³'
  }

  /**
   * 格式化件数
   * @param {number} count 件数
   * @returns {string} 格式化后的件数字符串
   */
  static formatCount(count) {
    if (count === null || count === undefined) return '0件'
    const num = Number(count)
    if (isNaN(num)) return '0件'
    return num + '件'
  }

  /**
   * 格式化物流状态
   * @param {string} status 状态码
   * @returns {string} 状态描述
   */
  static formatLogisticsStatus(status) {
    const statusMap = {
      '0': '已开单',
      '1': '已收货',
      '2': '运输中',
      '3': '派送中',
      '4': '已签收',
      '5': '异常',
      '6': '已取消'
    }
    return statusMap[status] || '未知状态'
  }

  /**
   * 格式化送货方式
   * @param {string} method 送货方式代码
   * @returns {string} 送货方式描述
   */
  static formatDeliveryMethod(method) {
    const methodMap = {
      '1': '自提',
      '2': '送货'
    }
    return methodMap[method] || '未知'
  }

  /**
   * 格式化放货方式
   * @param {string} method 放货方式代码
   * @returns {string} 放货方式描述
   */
  static formatReleaseMethod(method) {
    const methodMap = {
      '1': '等通知',
      '2': '其他'
    }
    return methodMap[method] || '未知'
  }

  /**
   * 格式化回单类型
   * @param {string} type 回单类型代码
   * @returns {string} 回单类型描述
   */
  static formatReceiptType(type) {
    const typeMap = {
      '1': '电子回单',
      '2': '纸质回单'
    }
    return typeMap[type] || '无'
  }

  /**
   * 格式化地址（截断过长的地址）
   * @param {string} address 地址
   * @param {number} maxLength 最大长度（默认：30）
   * @returns {string} 格式化后的地址
   */
  static formatAddress(address, maxLength = 30) {
    if (!address) return ''
    if (address.length <= maxLength) return address
    return address.substring(0, maxLength) + '...'
  }

  /**
   * 格式化相对时间（如：刚刚、5分钟前、1小时前）
   * @param {string|Date} date 日期
   * @returns {string} 相对时间描述
   */
  static formatRelativeTime(date) {
    if (!date) return ''
    
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return this.formatDate(date)
  }

  /**
   * 格式化文件大小
   * @param {number} bytes 字节数
   * @returns {string} 格式化后的文件大小
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
  }

  /**
   * 格式化百分比
   * @param {number} value 数值（0-1）
   * @param {number} decimals 小数位数（默认：2）
   * @returns {string} 格式化后的百分比字符串
   */
  static formatPercent(value, decimals = 2) {
    if (value === null || value === undefined) return '0%'
    const num = Number(value)
    if (isNaN(num)) return '0%'
    return (num * 100).toFixed(decimals) + '%'
  }

  /**
   * 格式化布尔值
   * @param {boolean} value 布尔值
   * @param {string} trueText 真值文本（默认：是）
   * @param {string} falseText 假值文本（默认：否）
   * @returns {string} 格式化后的文本
   */
  static formatBoolean(value, trueText = '是', falseText = '否') {
    return value ? trueText : falseText
  }
}

// 导出格式化工具类
module.exports = Formatter
