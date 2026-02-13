# 通知公告详情页

## 页面说明

通知公告详情页用于展示公告的完整内容，包括标题、作者、时间和详细内容。

## 功能特性

### 1. 公告详情展示
- 显示公告标题（居中，加粗，36rpx）
- 显示作者和时间信息（同一行，左右分布，灰色，24rpx）
- 显示完整的公告内容（左对齐，28rpx，行高1.6）
- 支持富文本格式（换行、长文本自动换行）

### 2. 数据加载策略
- **优先使用传递的数据**：从列表页跳转时携带完整数据，直接显示
- **备用接口加载**：如果没有传递数据，尝试调用 `/com/company-notice/get` 接口
- **权限处理**：接口调用失败时显示提示并返回上一页

### 3. 富文本支持
- 支持内容换行（white-space: pre-wrap）
- 支持长文本自动换行（word-break: break-all）
- 保持原始格式，提升阅读体验

## 页面参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 公告ID |
| data | String | 否 | 公告数据（JSON字符串，URL编码） |

## 使用示例

### 从列表页跳转（推荐）
```javascript
// 传递完整数据，避免权限问题
const notice = {
  id: 1,
  title: '公告标题',
  content: '公告内容',
  createTime: '2025-07-03',
  companyName: '公司名称'
}

wx.navigateTo({
  url: `/pages/notice-detail/notice-detail?id=${notice.id}&data=${encodeURIComponent(JSON.stringify(notice))}`
})
```

### 直接跳转（需要权限）
```javascript
// 只传递ID，页面会调用接口获取数据
wx.navigateTo({
  url: '/pages/notice-detail/notice-detail?id=1'
})
```

## 数据结构

### 公告详情
```javascript
{
  id: 1,                    // 公告ID
  title: '公告标题',         // 公告标题
  content: '公告内容',       // 公告内容（支持换行）
  contentAbstract: '摘要',   // 内容摘要
  type: 1,                  // 公告类型：1-通知 2-公告
  status: 0,                // 状态：0-正常 1-关闭
  createTime: '2025-07-03', // 创建时间
  companyId: null,          // 公司ID
  companyName: null         // 公司名称（作者）
}
```

## 样式设计

### 页面布局
- 背景色：#ffffff
- 内边距：32rpx
- 最小高度：100vh

### 公告标题
- 字号：36rpx
- 字重：bold（加粗）
- 颜色：#333333
- 对齐：居中
- 行高：1.4
- 底部间距：24rpx

### 作者和时间信息
- 布局：flex，左右分布
- 字号：24rpx
- 颜色：#999999
- 行高：1.5
- 底部间距：32rpx
- 底部边框：1rpx solid #E5E5E5

### 公告内容
- 字号：28rpx
- 颜色：#333333
- 行高：1.6
- 对齐：左对齐
- 换行：pre-wrap（保留换行符）
- 自动换行：break-all（长单词自动换行）

## 技术实现

### 数据加载逻辑
```javascript
onLoad(options) {
  const { id, data } = options
  
  // 优先使用传递的数据
  if (data) {
    try {
      const noticeData = JSON.parse(decodeURIComponent(data))
      this.setData({ noticeDetail: noticeData })
    } catch (error) {
      // 解析失败，调用接口
      this.loadNoticeDetail(id)
    }
  } else {
    // 没有数据，调用接口
    this.loadNoticeDetail(id)
  }
}
```

### 接口调用
```javascript
async loadNoticeDetail(id) {
  try {
    wx.showLoading({ title: '加载中...' })
    const result = await api.getCompanyNotice(id)
    wx.hideLoading()
    this.setData({ noticeDetail: result })
  } catch (error) {
    wx.hideLoading()
    wx.showToast({ 
      title: '加载失败，请从列表页进入', 
      icon: 'none',
      duration: 2000
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 2000)
  }
}
```

### 富文本样式
```css
.notice-content {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  white-space: pre-wrap;      /* 保留换行符 */
  word-break: break-all;      /* 长单词自动换行 */
}
```

## 数据加载流程

```
开始
  ↓
检查是否有传递data参数？
  ↓ 是
尝试解析data
  ↓
解析成功？
  ↓ 是
直接显示数据 → 结束
  ↓ 否
调用接口获取数据
  ↓
接口调用成功？
  ↓ 是
显示数据 → 结束
  ↓ 否
显示错误提示
  ↓
2秒后返回上一页 → 结束
```

## 注意事项

1. **数据传递优先**：从列表页跳转时，建议传递完整数据，避免因权限不足导致接口调用失败
2. **权限处理**：`/com/company-notice/get` 接口需要权限，如果用户没有权限，接口会返回错误
3. **错误提示**：接口调用失败时，显示友好提示并自动返回上一页
4. **数据解析**：使用 try-catch 包裹数据解析逻辑，防止解析失败导致页面崩溃
5. **富文本支持**：使用 CSS 属性支持换行和长文本自动换行，无需额外的富文本组件
6. **分享功能**：支持分享公告详情，分享路径包含公告ID

## 错误处理

### 参数错误
```javascript
if (!id) {
  wx.showToast({ title: '参数错误', icon: 'none' })
  setTimeout(() => wx.navigateBack(), 2000)
  return
}
```

### 数据解析失败
```javascript
try {
  const noticeData = JSON.parse(decodeURIComponent(data))
  this.setData({ noticeDetail: noticeData })
} catch (error) {
  console.error('解析公告数据失败:', error)
  this.loadNoticeDetail(id)  // 降级到接口加载
}
```

### 接口调用失败
```javascript
catch (error) {
  wx.showToast({ 
    title: '加载失败，请从列表页进入', 
    icon: 'none',
    duration: 2000
  })
  setTimeout(() => wx.navigateBack(), 2000)
}
```

## 相关页面

- [通知公告列表页](../notice-list/README.md)
- [物流公司详情页](../company-detail/README.md)
- [首页](../index/README.md)

## 优化建议

1. **缓存机制**：可以考虑缓存已加载的公告详情，避免重复请求
2. **图片支持**：如果公告内容包含图片，可以使用 rich-text 组件渲染
3. **分享优化**：分享时可以包含公告摘要，提升分享效果
4. **阅读统计**：可以添加阅读次数统计功能
5. **收藏功能**：可以添加收藏公告的功能
