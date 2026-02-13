/**
 * API 配置文件
 * 用于配置后端 API 基础地址和相关配置
 */

// 环境配置
const ENV = {
  // 开发环境
  DEV: 'development',
  // 测试环境
  TEST: 'test',
  // 生产环境
  PROD: 'production'
}

// 当前环境（默认开发环境）
const CURRENT_ENV = ENV.DEV

// API 基础地址配置
const API_BASE_URL = {
  // 开发环境 API 地址（待配置）
	// [ENV.DEV]: 'https://dev-api.example.com',
	[ENV.DEV]: 'http://localhost:9108/app-api',

  // 测试环境 API 地址（待配置）
  [ENV.TEST]: 'https://test-api.example.com/app-api',

  // 生产环境 API 地址（待配置）
  [ENV.PROD]: 'https://api.example.com/app-api'
}

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 10000

// 请求重试次数
const REQUEST_RETRY_COUNT = 2

// Token 存储键名
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// 导出配置
module.exports = {
  ENV,
  CURRENT_ENV,
  API_BASE_URL,
  REQUEST_TIMEOUT,
  REQUEST_RETRY_COUNT,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  
  /**
   * 获取当前环境的 API 基础地址
   * @returns {string} API 基础地址
   */
  getBaseURL() {
    return API_BASE_URL[CURRENT_ENV]
  }
}
