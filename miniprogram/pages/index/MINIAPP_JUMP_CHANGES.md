# 小程序跳转功能 - 代码修改对比

## 修改概览

本文档展示小程序跳转功能实现前后的代码变化，便于代码审查和理解修改内容。

---

## 1. app.json 配置文件

### 修改前

```json
{
  "pages": [
    "pages/index/index",
    "pages/waybill-verify/waybill-verify",
    "pages/waybill-detail/waybill-detail",
    "pages/company-detail/company-detail",
    "pages/notice-list/notice-list",
    "pages/notice-detail/notice-detail"
  ],
  "window": {
    "backgroundColor": "#F5F5F5",
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#FFFFFF",
    "navigationBarTitleText": "物流追踪",
    "navigationBarTextStyle": "black"
  },
  "sitemapLocation": "sitemap.json",
  "style": "v2",
  "lazyCodeLoading": "requiredComponents",
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于地图导航"
    }
  }
}
```

### 修改后

```json
{
  "pages": [
    "pages/index/index",
    "pages/waybill-verify/waybill-verify",
    "pages/waybill-detail/waybill-detail",
    "pages/company-detail/company-detail",
    "pages/notice-list/notice-list",
    "pages/notice-detail/notice-detail"
  ],
  "window": {
    "backgroundColor": "#F5F5F5",
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#FFFFFF",
    "navigationBarTitleText": "物流追踪",
    "navigationBarTextStyle": "black"
  },
  "navigateToMiniProgramAppIdList": [    // ← 新增：小程序跳转白名单
    "wxAPPID_ROUTE_QUERY",
    "wxAPPID_QUICK_ORDER"
  ],
  "sitemapLocation": "sitemap.json",
  "style": "v2",
  "lazyCodeLoading": "requiredComponents",
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于地图导航"
    }
  }
}
```

### 变化说明

✅ **新增配置**：
- 添加 `navigateToMiniProgramAppIdList` 字段
- 配置两个小程序 appId：线路查询和快捷下单
- 这是微信小程序跳转的必要配置

---

## 2. pages/index/index.js - 引入依赖

### 修改前

```javascript
// index.js - 首页逻辑
const api = require('../../services/api');
const auth = require('../../services/auth');
const storage = require('../../services/storage');
```

### 修改后

```javascript
// index.js - 首页逻辑
const api = require('../../services/api');
const auth = require('../../services/auth');
const storage = require('../../services/storage');
const miniappConfig = require('../../config/miniapp-config');  // ← 新增：引入小程序配置
```

### 变化说明

✅ **新增引入**：
- 引入 `miniapp-config.js` 配置文件
- 用于集中管理小程序跳转配置

---

## 3. pages/index/index.js - 查优质物流线路功能

### 修改前

```javascript
/**
 * 查优质物流线路
 */
onRouteQuery() {
  // TODO: 跳转到线路查询页面或小程序
  wx.showToast({
    title: '功能开发中',
    icon: 'none'
  });
}
```

### 修改后

```javascript
/**
 * 查优质物流线路
 * 跳转到线路查询小程序
 */
onRouteQuery() {
  // 弹出确认对话框
  wx.showModal({
    title: '提示',
    content: '即将跳转到线路查询小程序，是否继续？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 用户确认，执行跳转
        this.navigateToRouteQueryMiniApp();
      }
    }
  });
},

/**
 * 跳转到线路查询小程序
 */
navigateToRouteQueryMiniApp() {
  const config = miniappConfig.routeQuery;
  
  wx.navigateToMiniProgram({
    appId: config.appId,
    path: config.path,
    extraData: config.extraData,
    envVersion: config.envVersion,
    success: (res) => {
      console.log('跳转线路查询小程序成功', res);
    },
    fail: (error) => {
      console.error('跳转线路查询小程序失败', error);
      this.handleNavigateError(error);
    }
  });
}
```

### 变化说明

✅ **功能完善**：
- 移除 TODO 注释和临时提示
- 添加确认对话框，提升用户体验
- 实现完整的跳转逻辑
- 添加成功和失败回调处理

✅ **新增方法**：
- `navigateToRouteQueryMiniApp()` - 执行跳转逻辑
- 使用配置文件管理参数
- 调用统一的错误处理方法

---

## 4. pages/index/index.js - 网点快捷下单功能

### 修改前

```javascript
/**
 * 网点快捷下单
 */
async onQuickOrder() {
  // 检查登录状态
  if (!auth.isLoggedIn()) {
    wx.showModal({
      title: '提示',
      content: '请先登录后再下单',
      confirmText: '立即登录',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          await auth.login();
        }
      }
    });
    return;
  }
  
  // TODO: 跳转到下单页面或小程序
  wx.showToast({
    title: '功能开发中',
    icon: 'none'
  });
}
```

### 修改后

```javascript
/**
 * 网点快捷下单
 * 跳转到下单小程序
 */
async onQuickOrder() {
  // 检查登录状态
  if (!auth.isLoggedIn()) {
    wx.showModal({
      title: '提示',
      content: '请先登录后再下单',
      confirmText: '立即登录',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          const loginSuccess = await auth.login();
          
          if (loginSuccess) {
            // 登录成功后继续下单流程
            this.showQuickOrderConfirm();
          }
        }
      }
    });
    return;
  }
  
  // 已登录，显示确认对话框
  this.showQuickOrderConfirm();
},

/**
 * 显示快捷下单确认对话框
 */
showQuickOrderConfirm() {
  wx.showModal({
    title: '提示',
    content: '即将跳转到下单小程序，是否继续？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 用户确认，执行跳转
        this.navigateToQuickOrderMiniApp();
      }
    }
  });
},

/**
 * 跳转到下单小程序
 */
navigateToQuickOrderMiniApp() {
  // 获取用户信息（如果需要传递）
  const userInfo = storage.get('userInfo') || {};
  const config = miniappConfig.quickOrder;
  
  wx.navigateToMiniProgram({
    appId: config.appId,
    path: config.path,
    extraData: {
      ...config.extraData,
      userId: userInfo.id || '',
      userName: userInfo.name || ''
    },
    envVersion: config.envVersion,
    success: (res) => {
      console.log('跳转下单小程序成功', res);
    },
    fail: (error) => {
      console.error('跳转下单小程序失败', error);
      this.handleNavigateError(error);
    }
  });
}
```

### 变化说明

✅ **功能完善**：
- 移除 TODO 注释和临时提示
- 优化登录流程，登录成功后继续操作
- 添加确认对话框
- 实现完整的跳转逻辑

✅ **新增方法**：
- `showQuickOrderConfirm()` - 显示确认对话框
- `navigateToQuickOrderMiniApp()` - 执行跳转逻辑
- 支持传递用户信息到目标小程序

---

## 5. pages/index/index.js - 错误处理（新增）

### 修改前

无此方法

### 修改后

```javascript
/**
 * 处理小程序跳转错误
 * @param {Object} error - 错误对象
 */
handleNavigateError(error) {
  let errorMsg = '跳转失败';
  
  // 根据错误类型显示不同的提示信息
  if (error.errMsg.includes('appId')) {
    errorMsg = '目标小程序未配置或不存在';
  } else if (error.errMsg.includes('cancel')) {
    // 用户主动取消，不显示错误提示
    return;
  } else if (error.errMsg.includes('permission')) {
    errorMsg = '没有跳转权限';
  } else if (error.errMsg.includes('fail')) {
    errorMsg = '功能暂未开放，请稍后再试';
  }
  
  wx.showToast({
    title: errorMsg,
    icon: 'none',
    duration: 2000
  });
}
```

### 变化说明

✅ **新增方法**：
- 统一处理小程序跳转错误
- 根据错误类型显示友好提示
- 用户取消时不显示错误
- 提供明确的错误原因

---

## 6. config/miniapp-config.js（新增文件）

### 文件内容

```javascript
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
```

### 变化说明

✅ **新增文件**：
- 集中管理小程序跳转配置
- 便于维护和修改
- 支持配置不同的环境版本
- 详细的注释说明

---

## 修改总结

### 文件变更统计

| 文件 | 变更类型 | 行数变化 |
|-----|---------|---------|
| `app.json` | 修改 | +4 行 |
| `pages/index/index.js` | 修改 | +100 行 |
| `config/miniapp-config.js` | 新增 | +45 行 |

### 功能变更

#### 新增功能
1. ✅ 物流线路小程序跳转
2. ✅ 网点下单小程序跳转
3. ✅ 跳转错误处理
4. ✅ 用户确认对话框
5. ✅ 登录状态检查

#### 优化改进
1. ✅ 集中管理配置
2. ✅ 统一错误处理
3. ✅ 友好的用户提示
4. ✅ 完善的代码注释

### 代码质量

#### 优点
- ✅ 代码结构清晰
- ✅ 注释完整详细
- ✅ 错误处理完善
- ✅ 用户体验友好
- ✅ 配置管理规范

#### 待优化
- ⚠️ appId 需要替换为实际值
- ⚠️ 可以添加数据统计
- ⚠️ 可以添加降级方案

---

## 部署检查清单

部署前请确认以下事项：

- [ ] 已获取目标小程序的 appId
- [ ] 已在 `config/miniapp-config.js` 中替换 appId
- [ ] 已在 `app.json` 中更新 navigateToMiniProgramAppIdList
- [ ] 已测试跳转功能正常
- [ ] 已测试错误处理正常
- [ ] 已测试登录流程正常
- [ ] 已确认目标小程序已发布
- [ ] 已确认有跳转权限

---

**文档版本**：v1.0  
**更新日期**：2024-01-XX
