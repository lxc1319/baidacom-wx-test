/**
 * 数据验证工具
 * 提供常用的数据验证方法
 */

/**
 * 验证工具类
 */
class Validator {
  /**
   * 验证手机号格式
   * @param {string} phone 手机号
   * @returns {boolean} 是否有效
   */
  static isValidPhone(phone) {
    if (!phone) return false
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
  }

  /**
   * 验证身份证号格式
   * @param {string} idCard 身份证号
   * @returns {boolean} 是否有效
   */
  static isValidIdCard(idCard) {
    if (!idCard) return false
    // 18位身份证号正则
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return reg.test(idCard)
  }

  /**
   * 验证邮箱格式
   * @param {string} email 邮箱
   * @returns {boolean} 是否有效
   */
  static isValidEmail(email) {
    if (!email) return false
    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    return reg.test(email)
  }

  /**
   * 验证运单号格式
   * @param {string} waybillCode 运单号
   * @returns {boolean} 是否有效
   */
  static isValidWaybillCode(waybillCode) {
    if (!waybillCode) return false
    // 运单号通常是字母+数字组合，长度6-20位
    const reg = /^[A-Za-z0-9]{6,20}$/
    return reg.test(waybillCode)
  }

  /**
   * 验证是否为空
   * @param {*} value 值
   * @returns {boolean} 是否为空
   */
  static isEmpty(value) {
    if (value === null || value === undefined) return true
    if (typeof value === 'string' && value.trim() === '') return true
    if (Array.isArray(value) && value.length === 0) return true
    if (typeof value === 'object' && Object.keys(value).length === 0) return true
    return false
  }

  /**
   * 验证是否为数字
   * @param {*} value 值
   * @returns {boolean} 是否为数字
   */
  static isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
  }

  /**
   * 验证是否为整数
   * @param {*} value 值
   * @returns {boolean} 是否为整数
   */
  static isInteger(value) {
    return Number.isInteger(Number(value))
  }

  /**
   * 验证是否为正数
   * @param {*} value 值
   * @returns {boolean} 是否为正数
   */
  static isPositive(value) {
    return this.isNumber(value) && Number(value) > 0
  }

  /**
   * 验证字符串长度
   * @param {string} str 字符串
   * @param {number} min 最小长度
   * @param {number} max 最大长度
   * @returns {boolean} 是否在范围内
   */
  static isLengthInRange(str, min, max) {
    if (!str) return false
    const len = str.length
    return len >= min && len <= max
  }

  /**
   * 验证数值范围
   * @param {number} value 数值
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @returns {boolean} 是否在范围内
   */
  static isInRange(value, min, max) {
    if (!this.isNumber(value)) return false
    const num = Number(value)
    return num >= min && num <= max
  }

  /**
   * 验证URL格式
   * @param {string} url URL地址
   * @returns {boolean} 是否有效
   */
  static isValidUrl(url) {
    if (!url) return false
    const reg = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    return reg.test(url)
  }

  /**
   * 验证中文姓名
   * @param {string} name 姓名
   * @returns {boolean} 是否有效
   */
  static isValidChineseName(name) {
    if (!name) return false
    const reg = /^[\u4e00-\u9fa5]{2,10}$/
    return reg.test(name)
  }

  /**
   * 验证银行卡号
   * @param {string} cardNo 银行卡号
   * @returns {boolean} 是否有效
   */
  static isValidBankCard(cardNo) {
    if (!cardNo) return false
    // 银行卡号通常是16-19位数字
    const reg = /^\d{16,19}$/
    return reg.test(cardNo)
  }

  /**
   * 验证验证码（4位数字）
   * @param {string} code 验证码
   * @returns {boolean} 是否有效
   */
  static isValidVerifyCode(code) {
    if (!code) return false
    const reg = /^\d{4}$/
    return reg.test(code)
  }
}

// 导出验证工具类
module.exports = Validator
