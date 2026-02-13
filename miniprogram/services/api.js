/**
 * API 服务
 * 封装所有后端 API 接口调用
 */

const request = require('../utils/request.js')

/**
 * API 服务类
 */
class ApiService {
  /**
   * ==================== 运单相关 API ====================
   */

  /**
   * 全网查询运单
   * @param {string} waybillCode 运单号
   * @returns {Promise<Array>} 运单列表
   */
  async searchWaybill(waybillCode) {
    return await request.get('/com/waybill/search', {
      waybillCode
    }, {
      needAuth: true // 查询运单需要登录
    })
  }

  /**
   * 查询指定公司运单
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   * @returns {Promise<Object>} 运单信息
   */
  async searchWaybillByCompany(waybillCode, companyId) {
    return await request.get('/com/waybill/searchByCompanyId', {
      waybillCode,
      companyId
    }, {
      needAuth: false // 查询运单不需要登录
    })
  }

  /**
   * 获取运单详细信息
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   * @returns {Promise<Object>} 运单详情
   */
  async getWaybillInfo(waybillCode, companyId) {
    return await request.get('/com/waybill/getWaybillInfo', {
      waybillCode,
      companyId
    }, {
      needAuth: false, // 获取运单信息不需要登录
      useCache: true // 启用缓存，5分钟过期
    })
  }

  /**
   * 获取运单轨迹信息
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   * @returns {Promise<Array>} 运单轨迹列表
   */
  async getWaybillTrackInfo(waybillCode, companyId) {
    return await request.get('/com/waybill/getWaybillTrackInfo', {
      waybillCode,
      companyId
    }, {
      needAuth: false, // 获取轨迹信息不需要登录
      useCache: true // 启用缓存，5分钟过期
    })
  }

  /**
   * 标记为最近查询（需登录）
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   * @returns {Promise<boolean>} 是否成功
   */
  async markRecentSearch(waybillCode, companyId) {
    return await request.get('/com/waybill/markRecentSearch', {
      waybillCode,
      companyId
    })
  }

  /**
   * 获取最近查询分页列表（需登录）
   * @param {number} pageNo 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getRecentSearchPage(pageNo = 1, pageSize = 10) {
    return await request.get('/com/waybill/recentSearchPage', {
      pageNo,
      pageSize
    })
  }

  /**
   * 获取寄件订单分页列表（需登录）
   * @param {number} pageNo 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getSendOrderPage(pageNo = 1, pageSize = 10) {
    return await request.get('/com/waybill/sendOrderPage', {
      pageNo,
      pageSize
    })
  }

  /**
   * 获取收件订单分页列表（需登录）
   * @param {number} pageNo 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getCollectOrderPage(pageNo = 1, pageSize = 10) {
    return await request.get('/com/waybill/collectOrderPage', {
      pageNo,
      pageSize
    })
  }

  /**
   * 订阅/取消订阅运单（需登录）
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   * @param {boolean} isSubscribe 是否订阅
   * @returns {Promise<boolean>} 是否成功
   */
  async subscribeWaybill(waybillCode, companyId, isSubscribe) {
    return await request.get('/com/waybill/subscribe', {
      waybillCode,
      companyId,
      isSubscribe
    })
  }

  /**
   * 同步运单最新信息
   * @param {string} waybillCode 运单号
   * @param {number} companyId 公司ID
   * @returns {Promise<Object>} 最新运单信息
   */
  async reachWaybillInfo(waybillCode, companyId) {
    return await request.get('/com/waybill/reachWaybillInfo', {
      waybillCode,
      companyId
    }, {
      needAuth: false // 同步信息不需要登录
    })
  }

  /**
   * ==================== 物流公司相关 API ====================
   */

  /**
   * 获取物流公司信息（需权限）
   * @param {number} id 公司ID
   * @returns {Promise<Object>} 公司信息
   */
  async getCompanyById(id) {
    return await request.get('/com/company/get-by-id', {
      id
    }, {
      useCache: true // 启用缓存，1小时过期
    })
  }

  /**
   * 获取接入运单的公司列表
   * @returns {Promise<Array>} 公司列表
   */
  async getInnerCompanyList() {
    return await request.get('/com/company/innerCompanyList', {}, {
      needAuth: false, // 获取公司列表不需要登录
      useCache: true // 启用缓存，1小时过期
    })
  }

  /**
   * ==================== 线路相关 API ====================
   */

  /**
   * 分页查询线路信息
   * @param {Object} params 查询参数
   * @param {number} params.companyId 公司ID
   * @param {number} params.pageNo 页码
   * @param {number} params.pageSize 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getRouteInfoPage(params) {
    return await request.get('/com/route-info/page', params, {
      needAuth: false, // 查询线路不需要登录
      useCache: true // 启用缓存，30分钟过期
    })
  }

  /**
   * ==================== 通知公告相关 API ====================
   */

  /**
   * 获取通知公告分页列表
   * @param {Object} params 查询参数
   * @param {number} params.pageNo 页码
   * @param {number} params.pageSize 每页数量
   * @param {number} params.companyId 公司ID（可选）
   * @returns {Promise<Object>} 分页数据
   */
  async getCompanyNoticePage(params) {
    return await request.get('/system/notice/page', params, {
      needAuth: false, // 获取公告列表不需要登录
      useCache: true // 启用缓存，10分钟过期
    })
  }

  /**
   * 获取通知公告详情（需权限）
   * @param {number} id 公告ID
   * @returns {Promise<Object>} 公告详情
   */
  async getCompanyNotice(id) {
    return await request.get('/com/company-notice/get', {
      id
    })
  }

  /**
   * 获取公司通知公告分页列表
   * @param {Object} params 查询参数
   * @param {number} params.companyId 公司ID
   * @param {number} params.pageNo 页码
   * @param {number} params.pageSize 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getComCompanyNoticePage(params) {
    return await request.get('/com/company-notice/page', params, {
      needAuth: false, // 获取公告列表不需要登录
      useCache: true // 启用缓存，10分钟过期
    })
  }

  /**
   * 获取字典数据
   * @param {string} dictType 字典类型
   * @param {string} value 字典值
   * @returns {Promise<Object>} 字典数据
   */
  async getDictDataInfo(dictType, value) {
    return await request.get('/system/dict-data/get-by-value', {
      dictType,
      value
    }, {
      needAuth: false,
      useCache: true
    })
  }

  /**
   * ==================== 轮播图相关 API ====================
   */

  /**
   * 获取轮播图列表
   * @param {Object} params 查询参数
   * @param {number} params.companyId 公司ID（可选）
   * @returns {Promise<Array>} 轮播图列表
   */
  async getCompanyBannerList(params = {}) {
    // 自动设置 type=APP
    return await request.get('/system/banner/list', {
      ...params,
      type: 'APP'
    }, {
      needAuth: false, // 获取轮播图不需要登录
      useCache: true // 启用缓存，30分钟过期
    })
  }

  /**
   * 获取公司广告轮播图列表
   * @param {Object} params 查询参数
   * @param {number} params.companyId 公司ID
   * @returns {Promise<Array>} 广告轮播图列表
   */
  async getCompanyAdBannerList(params = {}) {
    return await request.get('/com/company-banner/list', params, {
      needAuth: false, // 获取广告轮播图不需要登录
      useCache: true // 启用缓存，30分钟过期
    })
  }

  /**
   * 获取首页底部广告列表（无需登录）
   * @param {Object} params 查询参数
   * @returns {Promise<Array>} 广告列表
   */
  async getAdInfoList(params = {}) {
    return await request.get('/com/ad-info/innerCompanyAdList', params, {
      needAuth: false, // 获取广告列表不需要登录
      useCache: true // 启用缓存，30分钟过期
    })
  }

  /**
   * ==================== 站内信相关 API ====================
   */

  /**
   * 获取我的站内信分页列表（需登录）
   * @param {number} pageNo 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getMyNotifyMessagePage(pageNo = 1, pageSize = 10) {
    return await request.get('/system/notify-message/my-page', {
      pageNo,
      pageSize
    })
  }

  /**
   * 获取站内信详情（需登录）
   * @param {number} id 站内信ID
   * @returns {Promise<Object>} 站内信详情
   */
  async getNotifyMessage(id) {
    return await request.get('/system/notify-message/get', {
      id
    })
  }

  /**
   * 更新通知消息为已读
   * @param {Array} ids 消息ID数组
   * @returns {Promise<boolean>}
   */
  async updateNotifyMessageRead(ids) {
    return await request.put('/system/notify-message/update-read', {
      ids
    })
  }

  /**
   * ==================== 运单订阅相关 API ====================
   */

  /**
   * 订阅/取消订阅运单
   * @param {string} waybillCode 运单号
   * @param {number} companyId 物流公司ID
   * @param {boolean} isSubscribe true-订阅 false-取消订阅
   * @returns {Promise<boolean>} 是否成功
   */
  async subscribeWaybill(waybillCode, companyId, isSubscribe) {
    return await request.get('/com/waybill/subscribe', {
      waybillCode,
      companyId,
      isSubscribe
    })
  }

  /**
   * 获取订阅订单分页列表
   * @param {number} pageNo 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getSubscribeOrderPage(pageNo = 1, pageSize = 10) {
    return await request.get('/com/waybill/subscribePage', {
      pageNo,
      pageSize
    })
  }

  /**
   * ==================== 首页相关 API ====================
   */

  /**
   * 获取首页轮播图
   * @returns {Promise<Array>} 轮播图列表
   */
  async getHomeBanners() {
    return await request.get('/system/banner/list', {
      type: 'APP',
      pageNo: 1,
      pageSize: 10
    }, {
      needAuth: false,
      useCache: true
    })
  }

  /**
   * 获取首页通知公告
   * @returns {Promise<Array>} 公告列表
   */
  async getHomeNotices() {
    return await request.get('/system/notice/page', {
      pageNo: 1,
      pageSize: 5,
      status: 1
    }, {
      needAuth: false,
      useCache: true
    })
  }

  /**
   * 获取首页底部广告
   * @returns {Promise<Array>} 广告列表
   */
  async getHomeAds() {
    return await request.get('/com/ad-info/innerCompanyAdList', {}, {
      needAuth: false,
      useCache: true
    })
  }
}

// 创建 API 服务实例
const apiService = new ApiService()

// 导出 API 服务实例
module.exports = apiService
