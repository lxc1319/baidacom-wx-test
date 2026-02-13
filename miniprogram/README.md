# 物流追踪微信小程序

## 项目简介

物流追踪微信小程序是一个为物流专线打造的运单追踪场景应用平台。该小程序允许用户通过输入运单号或扫码快速查询物流信息，管理寄件和收件订单，查看历史查询记录，并提供快捷下单和物流线路查询功能。

## 技术栈

- **开发框架**: 微信小程序原生框架
- **开发语言**: JavaScript
- **UI组件**: 微信小程序原生组件
- **状态管理**: 页面级状态管理
- **网络请求**: wx.request 封装
- **本地存储**: wx.storage API

## 项目结构

```
miniprogram/
├── pages/                    # 页面目录
│   ├── index/               # 首页（运单查询）
│   ├── waybill-verify/      # 运单身份验证页
│   ├── waybill-detail/      # 运单详情
│   ├── company-detail/      # 物流公司详情
│   ├── notice-list/         # 通知公告列表
│   └── notice-detail/       # 通知公告详情
├── components/              # 组件目录
│   ├── waybill-card/       # 运单卡片组件
│   ├── timeline/           # 时间轴组件
│   ├── banner-swiper/      # 轮播图组件
│   ├── code-input/         # 验证码输入组件
│   ├── barcode/            # 条形码展示组件
│   ├── notice-scroll/      # 滚动通知组件
│   ├── waybill-result-modal/ # 查询结果弹窗组件
│   └── tab-bar/            # 自定义标签栏
├── services/               # 服务层
│   ├── api.js             # API 请求封装
│   ├── auth.js            # 认证服务
│   └── storage.js         # 存储服务
├── utils/                  # 工具函数
│   ├── request.js         # 网络请求封装
│   ├── validator.js       # 数据验证
│   ├── formatter.js       # 数据格式化
│   └── phone-mask.js      # 手机号脱敏工具
├── config/                 # 配置文件
│   └── api-config.js      # API 配置
├── app.js                  # 小程序入口
├── app.json               # 小程序配置
└── app.wxss               # 全局样式
```

## 已完成功能

### 第一阶段：基础设施搭建 ✅

#### 1. 项目搭建
- ✅ 创建微信小程序项目
- ✅ 配置项目目录结构
- ✅ 配置 app.json 和 app.wxss
- ✅ 配置 API 基础地址

#### 2. 网络请求封装
- ✅ 实现 request.js 网络请求封装
- ✅ 实现请求拦截器（添加 Token）
- ✅ 实现响应拦截器（处理错误）
- ✅ 实现 Token 过期自动刷新

#### 3. 认证服务开发
- ✅ 实现微信登录功能
- ✅ 实现 Token 存储管理
- ✅ 实现 Token 刷新功能
- ✅ 实现登出功能

#### 4. 存储服务开发
- ✅ 实现本地存储封装
- ✅ 实现缓存管理功能
- ✅ 实现数据加密存储（基础版本）

#### 5. API 服务开发
- ✅ 封装运单相关 API
- ✅ 封装物流公司相关 API
- ✅ 封装通知公告相关 API
- ✅ 封装轮播图相关 API

#### 6. 工具函数开发
- ✅ 实现数据验证工具（validator.js）
- ✅ 实现数据格式化工具（formatter.js）
- ✅ 实现手机号脱敏工具（phone-mask.js）

## 核心模块说明

### 1. 网络请求模块（utils/request.js）

提供统一的网络请求接口，支持：
- 请求拦截：自动添加 Token
- 响应拦截：统一处理错误
- Token 自动刷新：Token 过期时自动刷新并重试请求
- 请求重试：网络错误时自动重试

**使用示例：**
```javascript
const request = require('./utils/request.js')

// GET 请求
const result = await request.get('/api/path', { param: 'value' })

// POST 请求
const result = await request.post('/api/path', { data: 'value' })
```

### 2. 认证服务模块（services/auth.js）

提供用户认证相关功能：
- 微信小程序登录
- Token 管理
- 登录状态检查
- 需要登录时的统一处理

**使用示例：**
```javascript
const authService = require('./services/auth.js')

// 微信登录
await authService.weixinLogin()

// 检查是否已登录
const isLoggedIn = authService.isLoggedIn()

// 需要登录时的处理
await authService.requireLogin(() => {
  // 登录成功后执行的操作
})
```

### 3. 存储服务模块（services/storage.js）

提供本地存储功能：
- 基础存储操作（增删改查）
- Token 存储管理
- 用户信息存储
- 缓存管理（带过期时间）

**使用示例：**
```javascript
const storage = require('./services/storage.js')

// 存储数据
await storage.set('key', 'value')

// 获取数据
const value = storage.get('key')

// 设置缓存（5分钟过期）
await storage.setCache('key', data, 5 * 60 * 1000)

// 获取缓存
const cachedData = storage.getCache('key')
```

### 4. API 服务模块（services/api.js）

封装所有后端 API 接口调用：
- 运单相关 API
- 物流公司相关 API
- 线路相关 API
- 通知公告相关 API
- 轮播图相关 API

**使用示例：**
```javascript
const api = require('./services/api.js')

// 查询运单
const waybills = await api.searchWaybill('运单号')

// 获取运单详情
const detail = await api.getWaybillInfo('运单号', 公司ID)

// 获取轮播图
const banners = await api.getCompanyBannerList()
```

### 5. 工具函数模块

#### 数据验证工具（utils/validator.js）
提供常用的数据验证方法：
- 手机号验证
- 身份证号验证
- 邮箱验证
- 运单号验证
- 等等...

**使用示例：**
```javascript
const Validator = require('./utils/validator.js')

// 验证手机号
const isValid = Validator.isValidPhone('13800138000')

// 验证运单号
const isValid = Validator.isValidWaybillCode('YD2024112700001')
```

#### 数据格式化工具（utils/formatter.js）
提供常用的数据格式化方法：
- 日期时间格式化
- 金额格式化
- 重量/体积格式化
- 物流状态格式化
- 等等...

**使用示例：**
```javascript
const Formatter = require('./utils/formatter.js')

// 格式化日期
const dateStr = Formatter.formatDate(new Date())

// 格式化金额
const amountStr = Formatter.formatAmount(123.45)

// 格式化物流状态
const statusStr = Formatter.formatLogisticsStatus('2')
```

#### 手机号脱敏工具（utils/phone-mask.js）
提供手机号脱敏相关功能：
- 手机号脱敏显示
- 获取手机号后四位
- 验证手机号后四位
- 手机号格式化
- 等等...

**使用示例：**
```javascript
const PhoneMask = require('./utils/phone-mask.js')

// 脱敏显示
const masked = PhoneMask.mask('13800138000') // 138****8000

// 获取后四位
const lastFour = PhoneMask.getLastFour('13800138000') // 8000

// 验证后四位
const isMatch = PhoneMask.verifyLastFour('13800138000', '8000') // true
```

## 配置说明

### API 配置（config/api-config.js）

配置后端 API 基础地址和相关参数：

```javascript
// 当前环境（开发/测试/生产）
const CURRENT_ENV = ENV.DEV

// API 基础地址
const API_BASE_URL = {
  [ENV.DEV]: 'https://dev-api.example.com',
  [ENV.TEST]: 'https://test-api.example.com',
  [ENV.PROD]: 'https://api.example.com'
}
```

**注意：** 在实际部署前，需要修改 API 基础地址为真实的后端地址。

## 开发规范

### 代码规范
- 所有函数必须添加完整的中文注释
- 使用 ES6+ 语法
- 遵循统一的代码风格
- 变量命名使用驼峰命名法

### 注释规范
```javascript
/**
 * 函数说明
 * @param {类型} 参数名 参数说明
 * @returns {类型} 返回值说明
 */
```

### 错误处理
- 所有异步操作必须使用 try-catch 捕获错误
- 网络请求失败时显示友好的错误提示
- 记录关键错误日志

## 下一步计划

### 第二阶段：公共组件开发
- [ ] 开发运单卡片组件
- [ ] 开发时间轴组件
- [ ] 开发轮播图组件
- [ ] 开发验证码输入组件
- [ ] 开发条形码展示组件
- [ ] 开发滚动通知组件
- [ ] 开发查询结果弹窗组件
- [ ] 开发空状态组件
- [ ] 开发加载组件

### 第三阶段：页面开发
- [ ] 首页开发
- [ ] 运单身份验证页开发
- [ ] 运单详情页开发
- [ ] 物流公司详情页开发
- [ ] 通知公告页面开发

### 第四阶段：功能完善
- [ ] 小程序跳转功能
- [ ] 错误处理
- [ ] 性能优化

### 第五阶段：测试与发布
- [ ] 功能测试
- [ ] 兼容性测试
- [ ] 性能测试
- [ ] 安全测试
- [ ] 发布准备

## 联系方式

如有问题，请联系开发团队。

## 更新日志

### v0.1.0 (2024-01-XX)
- ✅ 完成项目基础设施搭建
- ✅ 完成网络请求封装
- ✅ 完成认证服务开发
- ✅ 完成存储服务开发
- ✅ 完成 API 服务开发
- ✅ 完成工具函数开发
