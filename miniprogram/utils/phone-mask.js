/**
 * 手机号脱敏工具
 * 提供手机号脱敏、验证等功能
 */

const Validator = require('./validator.js')

/**
 * 手机号脱敏工具类
 */
class PhoneMask {
  /**
   * 脱敏显示手机号（显示前3位和后4位，中间用****代替）
   * @param {string} phone 手机号
   * @returns {string} 脱敏后的手机号
   * @example
   * PhoneMask.mask('13800138000') // 返回 '138****8000'
   */
  static mask(phone) {
    if (!phone) return ''
    
    // 如果不是有效的手机号，直接返回原值
    if (!Validator.isValidPhone(phone)) {
      return phone
    }
    
    // 显示前3位和后4位
    return phone.substring(0, 3) + '****' + phone.substring(7)
  }

  /**
   * 脱敏显示手机号（自定义显示位数）
   * @param {string} phone 手机号
   * @param {number} startLen 开始显示的位数（默认：3）
   * @param {number} endLen 结尾显示的位数（默认：4）
   * @param {string} maskChar 脱敏字符（默认：*）
   * @returns {string} 脱敏后的手机号
   * @example
   * PhoneMask.maskCustom('13800138000', 3, 4) // 返回 '138****8000'
   * PhoneMask.maskCustom('13800138000', 4, 3) // 返回 '1380***000'
   */
  static maskCustom(phone, startLen = 3, endLen = 4, maskChar = '*') {
    if (!phone) return ''
    
    const len = phone.length
    if (len <= startLen + endLen) {
      return phone
    }
    
    const start = phone.substring(0, startLen)
    const end = phone.substring(len - endLen)
    const maskLen = len - startLen - endLen
    const mask = maskChar.repeat(maskLen)
    
    return start + mask + end
  }

  /**
   * 获取手机号后四位
   * @param {string} phone 手机号
   * @returns {string} 手机号后四位
   * @example
   * PhoneMask.getLastFour('13800138000') // 返回 '8000'
   */
  static getLastFour(phone) {
    if (!phone || phone.length < 4) return ''
    return phone.slice(-4)
  }

  /**
   * 获取手机号前三位
   * @param {string} phone 手机号
   * @returns {string} 手机号前三位
   * @example
   * PhoneMask.getFirstThree('13800138000') // 返回 '138'
   */
  static getFirstThree(phone) {
    if (!phone || phone.length < 3) return ''
    return phone.substring(0, 3)
  }

  /**
   * 验证手机号格式
   * @param {string} phone 手机号
   * @returns {boolean} 是否有效
   * @example
   * PhoneMask.validate('13800138000') // 返回 true
   * PhoneMask.validate('12345678901') // 返回 false
   */
  static validate(phone) {
    return Validator.isValidPhone(phone)
  }

  /**
   * 验证手机号后四位
   * @param {string} phone 完整手机号
   * @param {string} lastFour 后四位
   * @returns {boolean} 是否匹配
   * @example
   * PhoneMask.verifyLastFour('13800138000', '8000') // 返回 true
   * PhoneMask.verifyLastFour('13800138000', '1234') // 返回 false
   */
  static verifyLastFour(phone, lastFour) {
    if (!phone || !lastFour) return false
    return this.getLastFour(phone) === lastFour
  }

  /**
   * 格式化手机号（添加空格分隔）
   * @param {string} phone 手机号
   * @param {string} separator 分隔符（默认：空格）
   * @returns {string} 格式化后的手机号
   * @example
   * PhoneMask.format('13800138000') // 返回 '138 0013 8000'
   * PhoneMask.format('13800138000', '-') // 返回 '138-0013-8000'
   */
  static format(phone, separator = ' ') {
    if (!phone) return ''
    
    // 如果不是有效的手机号，直接返回原值
    if (!Validator.isValidPhone(phone)) {
      return phone
    }
    
    // 格式：3-4-4
    return phone.substring(0, 3) + separator + 
           phone.substring(3, 7) + separator + 
           phone.substring(7)
  }

  /**
   * 移除手机号中的非数字字符
   * @param {string} phone 手机号
   * @returns {string} 纯数字手机号
   * @example
   * PhoneMask.clean('138 0013 8000') // 返回 '13800138000'
   * PhoneMask.clean('138-0013-8000') // 返回 '13800138000'
   */
  static clean(phone) {
    if (!phone) return ''
    return phone.replace(/\D/g, '')
  }

  /**
   * 判断是否为脱敏手机号
   * @param {string} phone 手机号
   * @returns {boolean} 是否为脱敏手机号
   * @example
   * PhoneMask.isMasked('138****8000') // 返回 true
   * PhoneMask.isMasked('13800138000') // 返回 false
   */
  static isMasked(phone) {
    if (!phone) return false
    return phone.includes('*')
  }

  /**
   * 获取手机号运营商
   * @param {string} phone 手机号
   * @returns {string} 运营商名称
   * @example
   * PhoneMask.getCarrier('13800138000') // 返回 '中国移动'
   * PhoneMask.getCarrier('18912345678') // 返回 '中国电信'
   */
  static getCarrier(phone) {
    if (!phone || phone.length < 3) return '未知'
    
    const prefix = phone.substring(0, 3)
    
    // 中国移动
    const cmPrefixes = ['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', '172', '178', '182', '183', '184', '187', '188', '198']
    if (cmPrefixes.includes(prefix)) {
      return '中国移动'
    }
    
    // 中国联通
    const cuPrefixes = ['130', '131', '132', '145', '155', '156', '166', '171', '175', '176', '185', '186']
    if (cuPrefixes.includes(prefix)) {
      return '中国联通'
    }
    
    // 中国电信
    const ctPrefixes = ['133', '149', '153', '173', '177', '180', '181', '189', '191', '199']
    if (ctPrefixes.includes(prefix)) {
      return '中国电信'
    }
    
    return '未知'
  }
}

// 导出手机号脱敏工具类
module.exports = PhoneMask
