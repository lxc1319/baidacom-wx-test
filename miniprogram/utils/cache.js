/**
 * 缓存管理工具
 * 提供内存缓存和本地存储缓存功�?
 * 支持缓存过期时间设置
 */

// 内存缓存对象
const memoryCache = {};

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  // 默认缓存过期时间�?分钟�?
  DEFAULT_EXPIRE_TIME: 5 * 60 * 1000,
  
  // 不同接口的缓存时间配置（毫秒�?
  EXPIRE_TIMES: {
    // 轮播图缓�?0分钟
    '/com/company-banner/list': 30 * 60 * 1000,
    
    // 通知公告缓存10分钟
    '/com/company-notice/page': 10 * 60 * 1000,
    
    // 公司信息缓存1小时
    '/com/company/get-by-id': 60 * 60 * 1000,
    '/com/company/innerCompanyList': 60 * 60 * 1000,
    
    // 线路信息缓存30分钟
    '/com/route-info/page': 30 * 60 * 1000,
    
    // 运单详情缓存5分钟（较短，因为状态可能变化）
    '/com/waybill/getWaybillInfo': 5 * 60 * 1000,
    '/com/waybill/getWaybillTrackInfo': 5 * 60 * 1000,
  }
};

/**
 * 生成缓存�?
 * @param {string} url - 接口URL
 * @param {object} params - 请求参数
 * @returns {string} 缓存�?
 */
function generateCacheKey(url, params = {}) {
  // 将参数排序后转为字符串，确保相同参数生成相同的key
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  const paramsStr = JSON.stringify(sortedParams);
  return `cache_${url}_${paramsStr}`;
}

/**
 * 获取缓存过期时间
 * @param {string} url - 接口URL
 * @returns {number} 过期时间（毫秒）
 */
function getExpireTime(url) {
  // 查找匹配的URL配置
  for (const [pattern, expireTime] of Object.entries(CACHE_CONFIG.EXPIRE_TIMES)) {
    if (url.includes(pattern)) {
      return expireTime;
    }
  }
  
  // 返回默认过期时间
  return CACHE_CONFIG.DEFAULT_EXPIRE_TIME;
}

/**
 * 设置内存缓存
 * @param {string} key - 缓存�?
 * @param {any} data - 缓存数据
 * @param {number} expireTime - 过期时间（毫秒）
 */
function setMemoryCache(key, data, expireTime) {
  memoryCache[key] = {
    data: data,
    timestamp: Date.now(),
    expireTime: expireTime
  };
}

/**
 * 获取内存缓存
 * @param {string} key - 缓存�?
 * @returns {any|null} 缓存数据，如果不存在或已过期则返回null
 */
function getMemoryCache(key) {
  const cache = memoryCache[key];
  
  if (!cache) {
    return null;
  }
  
  // 检查是否过�?
  const now = Date.now();
  if (now - cache.timestamp > cache.expireTime) {
    // 已过期，删除缓存
    delete memoryCache[key];
    return null;
  }
  
  return cache.data;
}

/**
 * 设置本地存储缓存
 * @param {string} key - 缓存�?
 * @param {any} data - 缓存数据
 * @param {number} expireTime - 过期时间（毫秒）
 */
function setStorageCache(key, data, expireTime) {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      expireTime: expireTime
    };
    
    wx.setStorageSync(key, cacheData);
  } catch (error) {
    console.error('设置本地缓存失败:', error);
  }
}

/**
 * 获取本地存储缓存
 * @param {string} key - 缓存�?
 * @returns {any|null} 缓存数据，如果不存在或已过期则返回null
 */
function getStorageCache(key) {
  try {
    const cache = wx.getStorageSync(key);
    
    if (!cache) {
      return null;
    }
    
    // 检查是否过�?
    const now = Date.now();
    if (now - cache.timestamp > cache.expireTime) {
      // 已过期，删除缓存
      wx.removeStorageSync(key);
      return null;
    }
    
    return cache.data;
  } catch (error) {
    console.error('获取本地缓存失败:', error);
    return null;
  }
}

/**
 * 设置缓存（同时设置内存缓存和本地存储缓存�?
 * @param {string} url - 接口URL
 * @param {object} params - 请求参数
 * @param {any} data - 缓存数据
 * @param {object} options - 选项
 * @param {boolean} options.memoryOnly - 是否仅使用内存缓�?
 * @param {number} options.expireTime - 自定义过期时间（毫秒�?
 */
function setCache(url, params, data, options = {}) {
  const key = generateCacheKey(url, params);
  const expireTime = options.expireTime || getExpireTime(url);
  
  // 设置内存缓存
  setMemoryCache(key, data, expireTime);
  
  // 如果不是仅内存缓存，则同时设置本地存储缓�?
  if (!options.memoryOnly) {
    setStorageCache(key, data, expireTime);
  }
}

/**
 * 获取缓存（优先从内存缓存获取，如果不存在则从本地存储获取�?
 * @param {string} url - 接口URL
 * @param {object} params - 请求参数
 * @returns {any|null} 缓存数据，如果不存在或已过期则返回null
 */
function getCache(url, params) {
  const key = generateCacheKey(url, params);
  
  // 优先从内存缓存获�?
  let data = getMemoryCache(key);
  
  if (data !== null) {
    return data;
  }
  
  // 从本地存储获�?
  data = getStorageCache(key);
  
  if (data !== null) {
    // 同步到内存缓�?
    const expireTime = getExpireTime(url);
    setMemoryCache(key, data, expireTime);
  }
  
  return data;
}

/**
 * 删除缓存
 * @param {string} url - 接口URL
 * @param {object} params - 请求参数
 */
function removeCache(url, params) {
  const key = generateCacheKey(url, params);
  
  // 删除内存缓存
  delete memoryCache[key];
  
  // 删除本地存储缓存
  try {
    wx.removeStorageSync(key);
  } catch (error) {
    console.error('删除本地缓存失败:', error);
  }
}

/**
 * 清空所有缓�?
 */
function clearAllCache() {
  // 清空内存缓存
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
  
  // 清空本地存储中的缓存（只清除以cache_开头的键）
  try {
    const info = wx.getStorageInfoSync();
    info.keys.forEach(key => {
      if (key.startsWith('cache_')) {
        wx.removeStorageSync(key);
      }
    });
  } catch (error) {
    console.error('清空本地缓存失败:', error);
  }
}

/**
 * 清理过期缓存
 */
function cleanExpiredCache() {
  const now = Date.now();
  
  // 清理内存缓存
  Object.keys(memoryCache).forEach(key => {
    const cache = memoryCache[key];
    if (now - cache.timestamp > cache.expireTime) {
      delete memoryCache[key];
    }
  });
  
  // 清理本地存储缓存
  try {
    const info = wx.getStorageInfoSync();
    info.keys.forEach(key => {
      if (key.startsWith('cache_')) {
        const cache = wx.getStorageSync(key);
        if (cache && now - cache.timestamp > cache.expireTime) {
          wx.removeStorageSync(key);
        }
      }
    });
  } catch (error) {
    console.error('清理过期缓存失败:', error);
  }
}

module.exports = {
  setCache,
  getCache,
  removeCache,
  clearAllCache,
  cleanExpiredCache,
  CACHE_CONFIG
};
