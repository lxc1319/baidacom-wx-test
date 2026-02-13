# 小程序跳转功能说明文档

## 功能概述

本文档说明首页快捷功能区的小程序跳转功能实现，包括"查优质物流线路"和"网点快捷下单"两个功能。

## 实现位置

- **页面文件**: `pages/index/index.js`
- **配置文件**: `config/miniapp-config.js`
- **全局配置**: `app.json`

## 功能详情

### 1. 查优质物流线路（onRouteQuery）

**功能说明**：
- 用户点击"查优质物流线路"按钮
- 弹出确认对话框询问是否跳转
- 用户确认后跳转到线路查询小程序

**实现流程**：
```
用户点击按钮
    ↓
显示确认对话框
    ↓
用户确认
    ↓
调用 wx.navigateToMiniProgram
    ↓
跳转成功/失败处理
```

**代码位置**：
- `onRouteQuery()` - 显示确认对话框
- `navigateToRouteQueryMiniApp()` - 执行跳转逻辑

**配置参数**：
```javascript
{
  appId: 'wxAPPID_ROUTE_QUERY',  // 目标小程序 appId（需替换）
  path: '',                       // 目标页面路径（空=首页）
  envVersion: 'release',          // 版本：develop/trial/release
  extraData: {                    // 传递的数据
    from: 'logistics-tracking'
  }
}
```

### 2. 网点快捷下单（onQuickOrder）

**功能说明**：
- 用户点击"网点快捷下单"按钮
- 检查登录状态（未登录则提示登录）
- 已登录用户显示确认对话框
- 用户确认后跳转到下单小程序

**实现流程**：
```
用户点击按钮
    ↓
检查登录状态
    ↓
未登录 → 显示登录提示 → 用户登录
    ↓
已登录 → 显示确认对话框
    ↓
用户确认
    ↓
调用 wx.navigateToMiniProgram（传递用户信息）
    ↓
跳转成功/失败处理
```

**代码位置**：
- `onQuickOrder()` - 检查登录状态
- `showQuickOrderConfirm()` - 显示确认对话框
- `navigateToQuickOrderMiniApp()` - 执行跳转逻辑

**配置参数**：
```javascript
{
  appId: 'wxAPPID_QUICK_ORDER',   // 目标小程序 appId（需替换）
  path: '',                        // 目标页面路径（空=首页）
  envVersion: 'release',           // 版本：develop/trial/release
  extraData: {                     // 传递的数据
    from: 'logistics-tracking',
    userId: '',                    // 用户ID（动态获取）
    userName: ''                   // 用户名（动态获取）
  }
}
```

### 3. 错误处理（handleNavigateError）

**功能说明**：
- 统一处理小程序跳转失败的情况
- 根据错误类型显示友好的提示信息

**错误类型**：
| 错误类型 | 错误信息包含 | 提示文字 |
|---------|------------|---------|
| appId 错误 | 'appId' | 目标小程序未配置或不存在 |
| 用户取消 | 'cancel' | 不显示提示（用户主动取消） |
| 权限错误 | 'permission' | 没有跳转权限 |
| 其他错误 | 'fail' | 功能暂未开放，请稍后再试 |

**代码位置**：
- `handleNavigateError(error)` - 统一错误处理方法

## 配置说明

### app.json 配置

需要在 `app.json` 中配置 `navigateToMiniProgramAppIdList`，声明需要跳转的小程序列表：

```json
{
  "navigateToMiniProgramAppIdList": [
    "wxAPPID_ROUTE_QUERY",
    "wxAPPID_QUICK_ORDER"
  ]
}
```

**注意事项**：
1. 最多可配置 10 个小程序 appId
2. appId 必须是真实存在的小程序
3. 跳转前需要确保目标小程序已发布

### miniapp-config.js 配置

在 `config/miniapp-config.js` 中集中管理小程序跳转配置：

```javascript
module.exports = {
  routeQuery: {
    appId: 'wxAPPID_ROUTE_QUERY',  // 需要替换为实际的 appId
    path: '',
    envVersion: 'release',
    extraData: { from: 'logistics-tracking' }
  },
  quickOrder: {
    appId: 'wxAPPID_QUICK_ORDER',  // 需要替换为实际的 appId
    path: '',
    envVersion: 'release',
    extraData: { from: 'logistics-tracking' }
  }
};
```

## 部署步骤

### 1. 获取目标小程序 appId

联系目标小程序的开发者或管理员，获取以下信息：
- 小程序 appId
- 目标页面路径（如果需要跳转到特定页面）
- 需要传递的参数格式

### 2. 更新配置文件

**步骤 1**：修改 `config/miniapp-config.js`
```javascript
// 将占位符替换为实际的 appId
routeQuery: {
  appId: 'wx1234567890abcdef',  // 实际的线路查询小程序 appId
  // ...
}
```

**步骤 2**：修改 `app.json`
```json
{
  "navigateToMiniProgramAppIdList": [
    "wx1234567890abcdef",  // 实际的线路查询小程序 appId
    "wx0987654321fedcba"   // 实际的下单小程序 appId
  ]
}
```

### 3. 测试跳转功能

**开发环境测试**：
1. 将 `envVersion` 设置为 `'develop'`
2. 在微信开发者工具中测试跳转
3. 确认能够成功跳转到目标小程序

**体验版测试**：
1. 将 `envVersion` 设置为 `'trial'`
2. 上传体验版进行测试
3. 确认跳转和数据传递正常

**正式版发布**：
1. 将 `envVersion` 设置为 `'release'`
2. 提交审核并发布
3. 在正式环境验证功能

## 常见问题

### Q1: 跳转失败，提示"目标小程序未配置或不存在"

**原因**：
- appId 配置错误
- 目标小程序未发布
- 目标小程序已下架

**解决方案**：
1. 检查 appId 是否正确
2. 确认目标小程序已发布
3. 联系目标小程序管理员确认状态

### Q2: 跳转失败，提示"没有跳转权限"

**原因**：
- 未在 app.json 中配置 navigateToMiniProgramAppIdList
- 目标小程序设置了跳转限制

**解决方案**：
1. 检查 app.json 配置是否正确
2. 联系目标小程序管理员开通跳转权限

### Q3: 如何传递更多参数到目标小程序？

**方法**：
修改 `extraData` 对象，添加需要传递的参数：

```javascript
extraData: {
  from: 'logistics-tracking',
  userId: userInfo.id,
  userName: userInfo.name,
  // 添加更多参数
  customParam1: 'value1',
  customParam2: 'value2'
}
```

**注意**：
- extraData 最大支持 1KB 数据
- 目标小程序需要在 `App.onLaunch` 或 `App.onShow` 中接收参数

### Q4: 如何跳转到目标小程序的特定页面？

**方法**：
修改 `path` 参数：

```javascript
{
  path: 'pages/route/route?id=123',  // 跳转到指定页面并传递参数
  // ...
}
```

## 技术要点

### 1. wx.navigateToMiniProgram API

**参数说明**：
- `appId`: 目标小程序的 appId（必填）
- `path`: 目标页面路径（选填，空则打开首页）
- `extraData`: 传递的数据（选填，最大 1KB）
- `envVersion`: 版本类型（选填，默认 release）
- `success`: 成功回调
- `fail`: 失败回调

**返回值**：
- 成功：跳转到目标小程序
- 失败：触发 fail 回调，返回错误信息

### 2. 数据传递

**发送方**（当前小程序）：
```javascript
wx.navigateToMiniProgram({
  extraData: {
    userId: '123',
    userName: '张三'
  }
})
```

**接收方**（目标小程序）：
```javascript
// app.js
App({
  onLaunch(options) {
    console.log('接收到的数据', options.referrerInfo.extraData);
  }
})
```

### 3. 版本控制

| 版本类型 | 说明 | 使用场景 |
|---------|------|---------|
| develop | 开发版 | 开发调试 |
| trial | 体验版 | 内部测试 |
| release | 正式版 | 线上环境 |

## 维护建议

1. **集中管理配置**：所有小程序跳转配置统一在 `miniapp-config.js` 中管理
2. **环境区分**：开发、测试、生产环境使用不同的 envVersion
3. **错误监控**：记录跳转失败的日志，便于排查问题
4. **用户体验**：跳转前显示确认对话框，避免用户误操作
5. **降级方案**：如果跳转失败，提供备用方案（如显示二维码）

## 更新日志

| 日期 | 版本 | 更新内容 |
|-----|------|---------|
| 2024-01-XX | 1.0.0 | 初始版本，实现基础跳转功能 |

## 相关文档

- [微信小程序官方文档 - wx.navigateToMiniProgram](https://developers.weixin.qq.com/miniprogram/dev/api/navigate/wx.navigateToMiniProgram.html)
- [小程序跳转配置说明](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/navigateToMiniProgram.html)
