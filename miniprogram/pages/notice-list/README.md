# 通知公告列表页

## 页面说明

通知公告列表页用于展示平台发布的通知公告列表，用户可以浏览公告标题并点击查看详情。

## 功能特性

### 1. 公告列表展示
- 以卡片形式展示每条公告
- 只显示公告标题，不显示摘要和时间
- 标题居中显示，黑色文字，字号32rpx
- 每条公告底部有红色"阅读详情"按钮

### 2. 数据加载
- 调用 `/com/company-notice/page` 接口获取公告列表
- 支持分页加载，每页10条数据
- 支持按公司ID筛选公告（可选参数）
- 显示加载状态和空状态提示

### 3. 交互功能
- **下拉刷新**：重新加载第一页数据
- **上拉加载更多**：自动加载下一页数据
- **点击阅读详情**：跳转到公告详情页，传递公告ID和完整数据

### 4. 状态提示
- **加载中**：显示"加载中..."提示
- **空状态**：显示"暂无通知公告"
- **没有更多**：显示"没有更多了"提示

## 页面参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| companyId | Number | 否 | 公司ID，用于筛选指定公司的公告 |

## 使用示例

### 查看所有公告
```javascript
wx.navigateTo({
  url: '/pages/notice-list/notice-list'
})
```

### 查看指定公司的公告
```javascript
wx.navigateTo({
  url: '/pages/notice-list/notice-list?companyId=123'
})
```

## 数据结构

### 公告列表项
```javascript
{
  id: 1,                    // 公告ID
  title: '公告标题',         // 公告标题
  content: '公告内容',       // 公告内容
  contentAbstract: '摘要',   // 内容摘要
  type: 1,                  // 公告类型：1-通知 2-公告
  status: 0,                // 状态：0-正常 1-关闭
  createTime: '2025-07-03', // 创建时间
  companyId: null,          // 公司ID
  companyName: null         // 公司名称
}
```

## 样式设计

### 页面布局
- 背景色：#f5f5f5
- 内边距：24rpx

### 公告卡片
- 背景色：#ffffff
- 圆角：16rpx
- 阴影：0 2rpx 8rpx rgba(0, 0, 0, 0.05)
- 内边距：32rpx
- 卡片间距：24rpx

### 公告标题
- 字号：32rpx
- 颜色：#333333
- 行高：1.6
- 对齐：居中
- 底部间距：24rpx

### 阅读详情按钮
- 字号：28rpx
- 颜色：#FF0000（红色）
- 对齐：居中
- 内边距：16rpx 0

### 底部提示
- 字号：24rpx
- 颜色：#999999
- 对齐：居中
- 内边距：32rpx 0

## 技术实现

### API调用
```javascript
// 获取公告列表
const result = await api.getCompanyNoticePage({
  pageNo: 1,
  pageSize: 10,
  companyId: 123  // 可选
})
```

### 下拉刷新
```javascript
async onPullDownRefresh() {
  this.setData({ pageNo: 1, hasMore: true })
  await this.loadNoticeList()
  wx.stopPullDownRefresh()
}
```

### 上拉加载更多
```javascript
async onReachBottom() {
  if (this.data.hasMore && !this.data.loading) {
    this.setData({ pageNo: this.data.pageNo + 1 })
    await this.loadNoticeList()
  }
}
```

### 跳转到详情页
```javascript
onReadDetail(e) {
  const notice = e.currentTarget.dataset.notice
  wx.navigateTo({
    url: `/pages/notice-detail/notice-detail?id=${notice.id}&data=${encodeURIComponent(JSON.stringify(notice))}`
  })
}
```

## 注意事项

1. **数据传递**：跳转到详情页时，同时传递公告ID和完整数据，避免详情页因权限不足无法加载
2. **分页加载**：使用 `hasMore` 标志判断是否还有更多数据，避免重复加载
3. **加载状态**：使用 `loading` 标志防止重复请求
4. **错误处理**：接口调用失败时显示友好提示，不影响用户体验
5. **性能优化**：列表数据采用增量加载，避免一次性加载过多数据

## 相关页面

- [通知公告详情页](../notice-detail/README.md)
- [物流公司详情页](../company-detail/README.md)
- [首页](../index/README.md)
