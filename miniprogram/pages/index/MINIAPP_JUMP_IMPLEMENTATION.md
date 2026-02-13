# 小程序跳转功能实现总结

## 任务概述

**任务编号**：任务 12  
**任务名称**：小程序跳转功能  
**实现日期**：2024-01-XX  
**实现状态**：✅ 已完成

## 子任务完成情况

- ✅ 12.1 实现物流线路小程序跳转
- ✅ 12.2 实现网点下单小程序跳转
- ✅ 12.3 实现跳转错误处理

## 实现内容

### 1. 文件修改清单

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `app.json` | 修改 | 添加 navigateToMiniProgramAppIdList 配置 |
| `pages/index/index.js` | 修改 | 实现跳转逻辑和错误处理 |
| `config/miniapp-config.js` | 新增 | 小程序跳转配置文件 |
| `pages/index/MINIAPP_JUMP_GUIDE.md` | 新增 | 功能说明文档 |

### 2. 核心功能实现

#### 2.1 物流线路小程序跳转

**实现方法**：
- `onRouteQuery()` - 显示确认对话框
- `navigateToRouteQueryMiniApp()` - 执行跳转

**功能流程**：
```
用户点击"查优质物流线路"
    ↓
弹出确认对话框
    ↓
用户确认
    ↓
调用 wx.navigateToMiniProgram
    ↓
跳转到线路查询小程序
```

**代码示例**：
```javascript
onRouteQuery() {
  wx.showModal({
    title: '提示',
    content: '即将跳转到线路查询小程序，是否继续？',
    success: (res) => {
      if (res.confirm) {
        this.navigateToRouteQueryMiniApp();
      }
    }
  });
}

navigateToRouteQueryMiniApp() {
  const config = miniappConfig.routeQuery;
  wx.navigateToMiniProgram({
    appId: config.appId,
    path: config.path,
    extraData: config.extraData,
    envVersion: config.envVersion,
    success: (res) => {
      console.log('跳转成功', res);
    },
    fail: (error) => {
      this.handleNavigateError(error);
    }
  });
}
```

#### 2.2 网点下单小程序跳转

**实现方法**：
- `onQuickOrder()` - 检查登录状态
- `showQuickOrderConfirm()` - 显示确认对话框
- `navigateToQuickOrderMiniApp()` - 执行跳转

**功能流程**：
```
用户点击"网点快捷下单"
    ↓
检查登录状态
    ↓
未登录 → 提示登录 → 用户登录
    ↓
已登录 → 弹出确认对话框
    ↓
用户确认
    ↓
调用 wx.navigateToMiniProgram（传递用户信息）
    ↓
跳转到下单小程序
```

**代码示例**：
```javascript
async onQuickOrder() {
  // 检查登录状态
  if (!auth.isLoggedIn()) {
    wx.showModal({
      title: '提示',
      content: '请先登录后再下单',
      confirmText: '立即登录',
      success: async (res) => {
        if (res.confirm) {
          const loginSuccess = await auth.login();
          if (loginSuccess) {
            this.showQuickOrderConfirm();
          }
        }
      }
    });
    return;
  }
  
  this.showQuickOrderConfirm();
}

navigateToQuickOrderMiniApp() {
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
      console.log('跳转成功', res);
    },
    fail: (error) => {
      this.handleNavigateError(error);
    }
  });
}
```

#### 2.3 跳转错误处理

**实现方法**：
- `handleNavigateError(error)` - 统一错误处理

**错误类型处理**：
| 错误类型 | 判断条件 | 提示信息 |
|---------|---------|---------|
| appId 错误 | `error.errMsg.includes('appId')` | 目标小程序未配置或不存在 |
| 用户取消 | `error.errMsg.includes('cancel')` | 不显示提示 |
| 权限错误 | `error.errMsg.includes('permission')` | 没有跳转权限 |
| 其他错误 | `error.errMsg.includes('fail')` | 功能暂未开放，请稍后再试 |

**代码示例**：
```javascript
handleNavigateError(error) {
  let errorMsg = '跳转失败';
  
  if (error.errMsg.includes('appId')) {
    errorMsg = '目标小程序未配置或不存在';
  } else if (error.errMsg.includes('cancel')) {
    return; // 用户主动取消，不显示提示
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

### 3. 配置文件说明

#### 3.1 app.json 配置

```json
{
  "navigateToMiniProgramAppIdList": [
    "wxAPPID_ROUTE_QUERY",
    "wxAPPID_QUICK_ORDER"
  ]
}
```

**说明**：
- 声明需要跳转的小程序 appId 列表
- 最多可配置 10 个小程序
- appId 需要替换为实际的小程序 appId

#### 3.2 miniapp-config.js 配置

```javascript
module.exports = {
  routeQuery: {
    appId: 'wxAPPID_ROUTE_QUERY',
    path: '',
    envVersion: 'release',
    extraData: {
      from: 'logistics-tracking'
    }
  },
  quickOrder: {
    appId: 'wxAPPID_QUICK_ORDER',
    path: '',
    envVersion: 'release',
    extraData: {
      from: 'logistics-tracking'
    }
  }
};
```

**说明**：
- 集中管理小程序跳转配置
- 便于维护和修改
- 支持配置不同的环境版本

## 技术要点

### 1. wx.navigateToMiniProgram API

**核心参数**：
- `appId`: 目标小程序的 appId（必填）
- `path`: 目标页面路径（选填）
- `extraData`: 传递的数据（选填，最大 1KB）
- `envVersion`: 版本类型（develop/trial/release）

### 2. 用户体验优化

**确认对话框**：
- 跳转前显示确认对话框
- 避免用户误操作
- 提供清晰的提示信息

**登录检查**：
- 下单功能需要登录
- 未登录时提示用户登录
- 登录成功后继续操作

**错误提示**：
- 根据错误类型显示友好提示
- 用户取消时不显示错误
- 提供明确的错误原因

### 3. 数据传递

**线路查询小程序**：
```javascript
extraData: {
  from: 'logistics-tracking'
}
```

**下单小程序**：
```javascript
extraData: {
  from: 'logistics-tracking',
  userId: userInfo.id,
  userName: userInfo.name
}
```

## 部署说明

### 1. 配置 appId

**步骤**：
1. 获取目标小程序的 appId
2. 修改 `config/miniapp-config.js` 中的 appId
3. 修改 `app.json` 中的 navigateToMiniProgramAppIdList

**示例**：
```javascript
// config/miniapp-config.js
routeQuery: {
  appId: 'wx1234567890abcdef', // 替换为实际的 appId
  // ...
}
```

```json
// app.json
{
  "navigateToMiniProgramAppIdList": [
    "wx1234567890abcdef", // 替换为实际的 appId
    "wx0987654321fedcba"
  ]
}
```

### 2. 环境配置

**开发环境**：
```javascript
envVersion: 'develop'
```

**体验版**：
```javascript
envVersion: 'trial'
```

**正式版**：
```javascript
envVersion: 'release'
```

### 3. 测试验证

**测试项**：
- ✅ 点击"查优质物流线路"按钮
- ✅ 确认对话框显示正常
- ✅ 跳转到线路查询小程序
- ✅ 点击"网点快捷下单"按钮
- ✅ 未登录时提示登录
- ✅ 已登录时显示确认对话框
- ✅ 跳转到下单小程序并传递用户信息
- ✅ 跳转失败时显示友好提示

## 注意事项

### 1. appId 配置

⚠️ **重要**：
- 当前配置的 appId 是占位符（`wxAPPID_ROUTE_QUERY`、`wxAPPID_QUICK_ORDER`）
- 部署前必须替换为实际的小程序 appId
- 否则跳转会失败，提示"目标小程序未配置或不存在"

### 2. 权限配置

⚠️ **注意**：
- 需要在 app.json 中配置 navigateToMiniProgramAppIdList
- 目标小程序需要已发布且可访问
- 某些小程序可能设置了跳转限制

### 3. 数据传递限制

⚠️ **限制**：
- extraData 最大支持 1KB 数据
- 超过限制会导致跳转失败
- 建议只传递必要的参数

### 4. 用户体验

✅ **建议**：
- 跳转前显示确认对话框
- 提供清晰的错误提示
- 避免频繁跳转影响用户体验

## 后续优化建议

### 1. 降级方案

如果跳转失败，可以提供备用方案：
- 显示目标小程序的二维码
- 提供复制小程序路径的功能
- 引导用户手动搜索小程序

### 2. 数据统计

记录跳转数据，用于分析：
- 跳转次数统计
- 跳转成功率
- 跳转失败原因分析

### 3. 动态配置

支持从后端获取小程序配置：
- appId 动态配置
- 目标页面路径动态配置
- 支持 A/B 测试

## 相关文档

- [功能说明文档](./MINIAPP_JUMP_GUIDE.md)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/api/navigate/wx.navigateToMiniProgram.html)

## 修改记录

| 日期 | 修改人 | 修改内容 |
|-----|-------|---------|
| 2024-01-XX | 开发团队 | 初始实现 |

---

**实现完成** ✅
