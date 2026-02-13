/**
 * 小程序跳转配置
 * 
 * 说明：
 * 1. 这里配置的 appId 是占位符，需要替换为实际的小程序 appId
 * 2. 小程序跳转需要在 app.json 的 navigateToMiniProgramAppIdList 中配置
 * 3. 跳转前需要确保目标小程序已发布且有权限跳转
 */

module.exports = {
  /**
   * 线路查询小程序配置
   */
  routeQuery: {
    // 小程序 appId（需要替换为实际值）
    appId: 'wxAPPID_ROUTE_QUERY',
    
    // 目标页面路径（空字符串表示打开首页）
    path: '',
    
    // 环境版本：develop（开发版）、trial（体验版）、release（正式版）
    envVersion: 'release',
    
    // 传递的额外数据
    extraData: {
      from: 'logistics-tracking'
    }
  },

  /**
   * 快捷下单小程序配置
   */
  quickOrder: {
    // 小程序 appId（需要替换为实际值）
    appId: 'wxAPPID_QUICK_ORDER',
    
    // 目标页面路径（空字符串表示打开首页）
    path: '',
    
    // 环境版本：develop（开发版）、trial（体验版）、release（正式版）
    envVersion: 'release',
    
    // 传递的额外数据
    extraData: {
      from: 'logistics-tracking'
    }
  }
};
