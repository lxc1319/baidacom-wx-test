# 错误处理使用指南

本文档说明小程序中错误处理和加载状态管理的使用方法。

## 目录
- [全局错误处理](#全局错误处理)
- [网络错误处理](#网络错误处理)
- [业务错误处理](#业务错误处理)
- [加载状态管理](#加载状态管理)

---

## 全局错误处理

### 功能说明
在 `app.js` 中实现了全局错误监听，自动捕获和处理未处理的错误。

### 实现内容
1. **全局错误监听**：使用 `wx.onError` 监听小程序错误
2. **Promise 错误监听**：使用 `wx.onUnhandledRejection` 监听未处理的 Promise 拒绝
3. **错误日志记录**：自动记录错误信息，便于排查问题
4. **友好提示**：向用户显示友好的错误提示信息

### 错误日志管理

#### 获取错误日志
```javascript
const app = getApp()
const errorLogs = app.getErrorLogs()
console.log('错误日志列表:', errorLogs)
```

#### 清空错误日志
```javascript
const app = getApp()
app.clearErrorLogs()
```

### 错误日志格式
```javascript
{
  type: 'global_error',           // 错误类型
  message: '错误信息',             // 错误消息
  stack: '错误堆栈',               // 错误堆栈
  timestamp: '2024-01-01T00:00:00Z' // 时间戳
}
```

---

## 网络错误处理

### 功能说明
在 `utils/request.js` 中实现了完善的网络错误处理，区分不同类型的网络错误。

### 错误类型

#### 1. 连接错误（CONNECTION_ERROR）
- **触发条件**：网络连接失败
- **提示信息**：网络连接失败，请检查网络设置
- **用户操作**：检查网络连接，重试请求

#### 2. 超时错误（TIMEOUT_ERROR）
- **触发条件**：请求超时
- **提示信息**：请求超时，请稍后重试
- **用户操作**：稍后重试

#### 3. 请求中断（ABORT_ERROR）
- **触发条件**：请求被取消
- **提示信息**：请求已取消
- **用户操作**：无需操作

### HTTP 状态码错误

| 状态码 | 错误类型 | 提示信息 |
|--------|----------|----------|
| 401 | 认证失败 | 登录已过期，请重新登录 |
| 403 | 无权限 | 无权限访问 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 500 | 服务器错误 | 服务器错误，请稍后重试 |
| 502/503/504 | 服务不可用 | 服务暂时不可用，请稍后重试 |

### 自动重试机制
- 网络错误时自动重试
- 默认重试次数：3次
- 可通过配置修改重试次数

---

## 业务错误处理

### 功能说明
在 `utils/request.js` 中实现了业务错误码映射，提供友好的错误提示。

### 常见业务错误码

| 错误码 | 错误类型 | 提示信息 |
|--------|----------|----------|
| 400 | 参数错误 | 请求参数错误 |
| 1001 | 运单不存在 | 运单号不存在 |
| 1002 | 查询失败 | 运单信息查询失败 |
| 1003 | 验证码错误 | 验证码错误 |
| 1004 | 手机号错误 | 手机号格式不正确 |
| 1005 | 订阅失败 | 订阅失败，请稍后重试 |
| 2001 | 公司不存在 | 公司信息不存在 |
| 2002 | 网点不存在 | 网点信息不存在 |
| 2003 | 线路不存在 | 线路信息不存在 |
| 3001 | 登录失败 | 登录失败，请重试 |
| 3002 | Token过期 | Token已过期 |
| 3003 | 刷新失败 | 刷新Token失败 |
| 4001 | 公告不存在 | 通知公告不存在 |
| 4002 | 加载失败 | 轮播图加载失败 |
| 5001 | 系统繁忙 | 系统繁忙，请稍后重试 |
| 5002 | 保存失败 | 数据保存失败 |
| 5003 | 更新失败 | 数据更新失败 |
| 5004 | 删除失败 | 数据删除失败 |

### 自定义错误提示
如果后端返回了错误信息，会优先使用后端的错误信息。

---

## 加载状态管理

### 功能说明
`utils/loading.js` 提供了全局加载状态管理功能。

### 基本使用

#### 1. 显示加载提示
```javascript
const loading = require('../../utils/loading.js')

// 显示默认加载提示
loading.show()

// 显示自定义加载提示
loading.show({
  title: '正在加载...',
  mask: true  // 是否显示透明蒙层
})
```

#### 2. 隐藏加载提示
```javascript
// 正常隐藏（会检查计数器）
loading.hide()

// 强制隐藏（忽略计数器）
loading.hide(true)
```

#### 3. 显示成功提示
```javascript
loading.showSuccess('操作成功')

// 自定义显示时长
loading.showSuccess('保存成功', 2000)
```

#### 4. 显示失败提示
```javascript
loading.showError('操作失败')

// 自定义显示时长
loading.showError('保存失败', 2500)
```

#### 5. 显示普通提示
```javascript
loading.showToast('提示信息')

// 自定义显示时长
loading.showToast('提示信息', 3000)
```

#### 6. 显示模态对话框
```javascript
const confirmed = await loading.showModal({
  title: '提示',
  content: '确定要删除吗？',
  showCancel: true,
  confirmText: '确定',
  cancelText: '取消'
})

if (confirmed) {
  // 用户点击了确定
  console.log('用户确认删除')
} else {
  // 用户点击了取消
  console.log('用户取消删除')
}
```

### 高级功能

#### 1. 并发请求支持
加载管理器使用计数器机制，支持多个并发请求：
```javascript
// 第一个请求
loading.show()  // 显示加载提示，计数器 = 1

// 第二个请求
loading.show()  // 不重复显示，计数器 = 2

// 第一个请求完成
loading.hide()  // 不隐藏提示，计数器 = 1

// 第二个请求完成
loading.hide()  // 隐藏提示，计数器 = 0
```

#### 2. 自动隐藏机制
- 最大显示时间：30秒
- 超时后自动隐藏，防止加载提示一直显示
- 可以通过修改 `maxShowTime` 属性调整超时时间

#### 3. 重置加载状态
在异常情况下，可以强制重置所有状态：
```javascript
loading.reset()
```

#### 4. 获取当前状态
```javascript
const status = loading.getStatus()
console.log('加载计数:', status.loadingCount)
console.log('是否显示:', status.isShowing)
```

### 在网络请求中使用

#### 默认行为（自动显示加载提示）
```javascript
const api = require('../../services/api.js')

// 自动显示"加载中..."提示
const result = await api.get('/com/waybill/search', { waybillCode: 'YD001' })
```

#### 自定义加载提示文字
```javascript
const request = require('../../utils/request.js')

const result = await request.get('/com/waybill/search', 
  { waybillCode: 'YD001' },
  { 
    loadingText: '正在查询运单...'
  }
)
```

#### 禁用加载提示
```javascript
const request = require('../../utils/request.js')

// 不显示加载提示
const result = await request.get('/com/waybill/search', 
  { waybillCode: 'YD001' },
  { 
    showLoading: false
  }
)
```

### 完整示例

```javascript
Page({
  data: {
    waybillInfo: null
  },

  /**
   * 查询运单信息
   */
  async queryWaybill() {
    const loading = require('../../utils/loading.js')
    const api = require('../../services/api.js')

    try {
      // 显示加载提示
      loading.show({ title: '正在查询...' })

      // 调用接口
      const result = await api.get('/com/waybill/search', {
        waybillCode: this.data.waybillCode
      })

      // 隐藏加载提示
      loading.hide()

      // 更新数据
      this.setData({ waybillInfo: result })

      // 显示成功提示
      loading.showSuccess('查询成功')

    } catch (error) {
      // 隐藏加载提示
      loading.hide()

      // 显示错误提示
      loading.showError(error.message || '查询失败')
    }
  },

  /**
   * 删除运单（带确认对话框）
   */
  async deleteWaybill() {
    const loading = require('../../utils/loading.js')
    const api = require('../../services/api.js')

    // 显示确认对话框
    const confirmed = await loading.showModal({
      title: '确认删除',
      content: '确定要删除这条运单吗？',
      confirmText: '删除',
      cancelText: '取消'
    })

    if (!confirmed) {
      return
    }

    try {
      // 显示加载提示
      loading.show({ title: '正在删除...' })

      // 调用接口
      await api.delete('/com/waybill/delete', {
        id: this.data.waybillId
      })

      // 显示成功提示
      loading.showSuccess('删除成功')

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      // 显示错误提示
      loading.showError(error.message || '删除失败')
    }
  }
})
```

---

## 最佳实践

### 1. 错误处理原则
- ✅ 所有异步操作都要使用 try-catch 捕获错误
- ✅ 网络请求失败时显示友好的错误提示
- ✅ 不要向用户显示技术性的错误信息
- ✅ 提供重试选项或引导用户解决问题

### 2. 加载提示原则
- ✅ 所有网络请求都应该显示加载提示
- ✅ 加载提示文字要简洁明了
- ✅ 及时隐藏加载提示，避免影响用户体验
- ✅ 使用计数器机制处理并发请求

### 3. 用户体验原则
- ✅ 错误提示要简洁友好，避免技术术语
- ✅ 提供明确的操作指引
- ✅ 避免频繁弹出提示影响用户体验
- ✅ 重要操作要有确认对话框

### 4. 日志记录原则
- ✅ 记录所有错误信息便于排查问题
- ✅ 错误日志要包含时间戳和错误类型
- ✅ 定期清理错误日志，避免占用过多内存
- ✅ 在生产环境可以将错误上报到服务器

---

## 注意事项

1. **加载提示不要嵌套使用**
   ```javascript
   // ❌ 错误示例
   loading.show()
   loading.show()  // 不会重复显示
   
   // ✅ 正确示例
   loading.show()
   // ... 执行操作
   loading.hide()
   ```

2. **确保加载提示被正确隐藏**
   ```javascript
   // ❌ 错误示例
   loading.show()
   await api.get('/api/data')
   // 忘记调用 loading.hide()
   
   // ✅ 正确示例
   try {
     loading.show()
     await api.get('/api/data')
     loading.hide()
   } catch (error) {
     loading.hide()  // 确保在错误情况下也隐藏
   }
   ```

3. **使用网络请求的自动加载管理**
   ```javascript
   // ✅ 推荐：使用自动加载管理
   const result = await api.get('/api/data')
   
   // 不推荐：手动管理加载状态
   loading.show()
   const result = await api.get('/api/data', {}, { showLoading: false })
   loading.hide()
   ```

4. **异常情况下重置状态**
   ```javascript
   // 在页面卸载时重置加载状态
   onUnload() {
     const loading = require('../../utils/loading.js')
     loading.reset()
   }
   ```

---

## 总结

本小程序实现了完善的错误处理和加载状态管理机制：

1. **全局错误处理**：自动捕获和记录所有错误
2. **网络错误处理**：区分不同类型的网络错误，提供友好提示
3. **业务错误处理**：映射业务错误码，显示具体错误信息
4. **加载状态管理**：统一管理加载提示，支持并发请求

这些机制确保了良好的用户体验和系统稳定性。
