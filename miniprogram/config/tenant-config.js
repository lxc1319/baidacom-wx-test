/**
 * 租户配置文件
 * 用于配置多租户相关的参数
 */

// 默认租户ID
const DEFAULT_TENANT_ID = '1'

// 租户请求头名称
const TENANT_HEADER_NAME = 'tenant-id'

/**
 * 获取当前租户ID
 * @returns {string} 租户ID
 */
function getTenantId() {
  // 从本地存储获取租户ID，如果没有则使用默认值
  try {
    const tenantId = wx.getStorageSync('tenant_id')
    return tenantId || DEFAULT_TENANT_ID
  } catch (error) {
    return DEFAULT_TENANT_ID
  }
}

/**
 * 设置租户ID
 * @param {string} tenantId 租户ID
 */
function setTenantId(tenantId) {
  try {
    wx.setStorageSync('tenant_id', tenantId)
  } catch (error) {
    // 存储失败
  }
}

module.exports = {
  DEFAULT_TENANT_ID,
  TENANT_HEADER_NAME,
  getTenantId,
  setTenantId
}
