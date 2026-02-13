# 物流追踪小程序 - 组件说明文档

本文档说明物流追踪微信小程序中所有自定义组件的功能、使用方法和属性说明。

## 组件列表

### 1. 运单卡片组件（waybill-card）

**功能说明**：
- 用于在运单列表中展示运单的关键信息
- 支持收藏/订阅功能
- 支持点击跳转到运单详情

**使用示例**：
```xml
<waybill-card 
  waybillData="{{item}}"
  displayType="recent"
  bind:cardclick="onCardClick"
  bind:subscribe="onSubscribe"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| waybillData | Object | {} | 运单数据对象 |
| displayType | String | 'recent' | 显示类型：recent-最近查询, send-寄件订单, collect-收件订单 |

**事件说明**：
| 事件名 | 说明 | 返回参数 |
|--------|------|----------|
| cardclick | 点击卡片时触发 | {waybillCode, companyId} |
| subscribe | 点击收藏图标时触发 | {waybillCode, companyId, isSubscribed} |

**样式特点**：
- 未订阅状态：空心星标（☆黄色边框，#FFD700）
- 已订阅状态：实心星标（★红色填充，#FF0000）

---

### 2. 时间轴组件（timeline）

**功能说明**：
- 用于展示物流轨迹信息
- 支持垂直时间轴布局
- 显示时间、内容、节点信息

**使用示例**：
```xml
<timeline trackList="{{trackList}}" />
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| trackList | Array | [] | 物流轨迹列表 |

**数据格式**：
```javascript
{
  createTime: '2024-11-27 14:52',  // 操作时间
  eventLog: '已开单',               // 操作内容
  eventNode: '总部开票',            // 操作节点
  deptName: '郑州总部',             // 操作部门
  userName: '张三'                  // 操作员
}
```

---

### 3. 轮播图组件（banner-swiper）

**功能说明**：
- 用于展示物流公司的宣传图片
- 支持自动播放、手势滑动
- 支持点击跳转

**使用示例**：
```xml
<banner-swiper 
  banners="{{banners}}"
  autoplay="{{true}}"
  interval="{{4000}}"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| banners | Array | [] | 轮播图数据列表 |
| autoplay | Boolean | true | 是否自动播放 |
| interval | Number | 4000 | 自动切换时间间隔（毫秒） |
| duration | Number | 500 | 滑动动画时长（毫秒） |
| circular | Boolean | true | 是否循环播放 |

**数据格式**：
```javascript
{
  id: 1,
  imageUrl: 'https://example.com/banner.jpg',
  companyId: 123,  // 可选，跳转到公司详情页
  linkUrl: ''      // 可选，其他跳转链接
}
```

---

### 4. 验证码输入组件（code-input）

**功能说明**：
- 用于输入4位数字验证码
- 支持自动聚焦和切换
- 输入完成自动触发验证

**使用示例**：
```xml
<code-input 
  codeLength="{{4}}"
  autoFocus="{{true}}"
  bind:change="onCodeChange"
  bind:complete="onCodeComplete"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| codeLength | Number | 4 | 验证码长度 |
| autoFocus | Boolean | true | 是否自动聚焦 |

**事件说明**：
| 事件名 | 说明 | 返回参数 |
|--------|------|----------|
| change | 输入变化时触发 | {value} |
| complete | 输入完成时触发 | {value} |

**方法说明**：
- `clear()`: 清空验证码
- `getValue()`: 获取验证码值

---

### 5. 条形码展示组件（barcode）

**功能说明**：
- 用于生成和展示运单号的条形码
- 支持长按保存

**使用示例**：
```xml
<barcode 
  code="{{waybillCode}}"
  width="{{600}}"
  height="{{200}}"
  showTip="{{true}}"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| code | String | '' | 条形码内容（运单号） |
| width | Number | 600 | 条形码宽度（rpx） |
| height | Number | 200 | 条形码高度（rpx） |
| showTip | Boolean | true | 是否显示提示 |

---

### 6. 滚动通知组件（notice-scroll）

**功能说明**：
- 用于展示通知公告
- 支持跑马灯效果（垂直滚动）
- 左侧喇叭图标，右侧箭头图标

**使用示例**：
```xml
<notice-scroll 
  noticeList="{{noticeList}}"
  bind:click="onNoticeClick"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| noticeList | Array | [] | 通知列表 |
| autoplay | Boolean | true | 是否自动播放 |
| interval | Number | 3000 | 自动切换时间间隔（毫秒） |
| duration | Number | 500 | 滑动动画时长（毫秒） |
| circular | Boolean | true | 是否循环播放 |

**事件说明**：
| 事件名 | 说明 |
|--------|------|
| click | 点击通知时触发 |

---

### 7. 查询结果弹窗组件（waybill-result-modal）

**功能说明**：
- 用于展示运单查询结果
- 以表格形式显示关键信息
- 支持从底部滑入动画

**使用示例**：
```xml
<waybill-result-modal 
  visible="{{showModal}}"
  waybillData="{{currentWaybill}}"
  bind:close="onCloseModal"
  bind:viewdetail="onViewDetail"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示弹窗 |
| waybillData | Object | {} | 运单数据 |

**事件说明**：
| 事件名 | 说明 | 返回参数 |
|--------|------|----------|
| close | 关闭弹窗时触发 | - |
| viewdetail | 点击查看详情时触发 | {waybillCode, companyId} |

**显示字段**：
- 收货人（collectName）
- 收货地址（collectAddress）
- 操作（查看详情链接）

---

### 8. 空状态组件（empty-state）

**功能说明**：
- 用于展示空数据状态
- 支持自定义图标、文字和操作按钮

**使用示例**：
```xml
<empty-state 
  icon="📦"
  text="暂无运单"
  description="您还没有查询过运单"
  buttonText="去查询"
  bind:buttonclick="onButtonClick"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| icon | String | '📦' | 图标（emoji或图标字符） |
| text | String | '暂无数据' | 提示文字 |
| description | String | '' | 描述文字 |
| buttonText | String | '' | 按钮文字 |

**事件说明**：
| 事件名 | 说明 |
|--------|------|
| buttonclick | 点击按钮时触发 |

---

### 9. 加载组件（loading）

**功能说明**：
- 用于展示加载状态
- 支持全屏和局部加载两种模式

**使用示例**：
```xml
<!-- 全屏加载 -->
<loading 
  visible="{{isLoading}}"
  text="加载中..."
  fullscreen="{{true}}"
/>

<!-- 局部加载 -->
<loading 
  visible="{{isLoading}}"
  text="加载中..."
  fullscreen="{{false}}"
/>
```

**属性说明**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示加载 |
| text | String | '加载中...' | 加载文字 |
| fullscreen | Boolean | false | 是否全屏显示 |

---

## 组件使用注意事项

### 1. 组件引入

在页面的 `.json` 文件中引入组件：

```json
{
  "usingComponents": {
    "waybill-card": "/components/waybill-card/waybill-card",
    "timeline": "/components/timeline/timeline",
    "banner-swiper": "/components/banner-swiper/banner-swiper",
    "code-input": "/components/code-input/code-input",
    "barcode": "/components/barcode/barcode",
    "notice-scroll": "/components/notice-scroll/notice-scroll",
    "waybill-result-modal": "/components/waybill-result-modal/waybill-result-modal",
    "empty-state": "/components/empty-state/empty-state",
    "loading": "/components/loading/loading"
  }
}
```

### 2. 样式覆盖

如需自定义组件样式，可以在页面的 `.wxss` 文件中覆盖：

```css
/* 覆盖运单卡片样式 */
waybill-card {
  margin-bottom: 20rpx;
}
```

### 3. 事件处理

组件事件使用 `bind:` 或 `catch:` 绑定：

```xml
<!-- 使用 bind: 允许事件冒泡 -->
<waybill-card bind:cardclick="onCardClick" />

<!-- 使用 catch: 阻止事件冒泡 -->
<waybill-card catch:cardclick="onCardClick" />
```

### 4. 数据传递

组件属性支持数据绑定：

```xml
<waybill-card waybillData="{{item}}" />
```

### 5. 组件方法调用

使用 `selectComponent` 获取组件实例并调用方法：

```javascript
// 获取验证码输入组件实例
const codeInput = this.selectComponent('#codeInput')

// 调用组件方法
codeInput.clear()
const value = codeInput.getValue()
```

---

## 开发规范

### 1. 组件命名

- 组件名使用小写字母和连字符（kebab-case）
- 组件文件夹名与组件名保持一致
- 组件文件包含：`.wxml`、`.wxss`、`.js`、`.json` 四个文件

### 2. 代码注释

- 所有函数添加完整的中文注释
- 说明函数功能、参数和返回值
- 复杂逻辑添加行内注释

### 3. 属性定义

- 使用 `properties` 定义组件属性
- 提供默认值和类型检查
- 使用 `observer` 监听属性变化

### 4. 事件触发

- 使用 `triggerEvent` 触发自定义事件
- 事件名使用小写字母
- 传递必要的数据参数

### 5. 生命周期

- 使用 `lifetimes` 定义生命周期函数
- 在 `attached` 中初始化组件
- 在 `detached` 中清理资源

---

## 更新日志

### v1.0.0 (2024-11-27)
- ✅ 完成运单卡片组件开发
- ✅ 完成时间轴组件开发
- ✅ 完成轮播图组件开发
- ✅ 完成验证码输入组件开发
- ✅ 完成条形码展示组件开发
- ✅ 完成滚动通知组件开发
- ✅ 完成查询结果弹窗组件开发
- ✅ 完成空状态组件开发
- ✅ 完成加载组件开发

---

## 联系方式

如有问题或建议，请联系开发团队。
