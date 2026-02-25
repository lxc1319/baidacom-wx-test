// pages/exampleDetail/index.js
Page({
  data: {
    type: "",
    envId: "",
    showTip: false,
    title: "",
    content: "",

    haveGetOpenId: false,
    openId: "",

    haveGetCodeSrc: false,
    codeSrc: "",

    haveGetRecord: false,
    record: [],

    haveGetImgSrc: false,
    imgSrc: "",

    // ai
    modelConfig: {
      modelProvider: "deepseek",
      quickResponseModel: "deepseek-v3",
      logo: "https://cloudcache.tencent-cloud.com/qcloud/ui/static/static_source_business/2339414f-2c0d-4537-9618-1812bd14f4af.svg",
      welcomeMsg: "我是deepseek-v3，很高兴见到你！"
    },
    callcbrCode: "",
    initEnvCode: "",
    callOpenIdCode: "",
    callMiniProgramCode: "",
    callFunctionCode: "",
    callCreateCollectionCode: "",
    callUploadFileCode: "",

    showInsertModal: false,
    insertRegion: "",
    insertCity: "",
    insertSales: "",

    haveGetCallContainerRes: false,
    callContainerResStr: "",

    ai_page_config: '{"usingComponents":{"agent-ui":"/components/agent-ui/index"}}',
    ai_wxml_config: '&lt;agent-ui agentConfig="{{agentConfig}}" showBotAvatar="{{showBotAvatar}}" chatMode="{{chatMode}}" modelConfig="{{modelConfig}}"&gt;&lt;/agent-ui&gt;',
    ai_data_config: 'data: {chatMode: "bot", showBotAvatar: true, agentConfig: {botId: "your agent id", allowWebSearch: true, allowUploadFile: true, allowPullRefresh: true, allowUploadImage: true, allowMultiConversation: true, showToolCallDetail: true, allowVoice: true, showBotName: true}, modelConfig: {modelProvider: "hunyuan-open", quickResponseModel: "hunyuan-lite", logo: "", welcomeMsg: "欢迎使用"}}',

    // AI 场景示例数据
    aiScenarios: [
      {
        title: "💡 智能代码生成与补全",
        examples: [
          "帮我创建一个商品列表页面，包含图片、标题、价格和加入购物车按钮",
          "帮我完善这个函数,实现商品搜索功能"
        ]
      },
      {
        title: "🔧 代码优化与重构建",
        examples: [
          "优化这段代码的性能,减少不必要的渲染",
          "完善云函数调用的错误处理代码"
        ]
      }
    ]
  },

  onLoad: function(options) {
    if (options.type === "cloudbaserunfunction" || options.type === "cloudbaserun") {
      this.getCallcbrCode();
    }
    if (options.type === "getOpenId") {
      this.getOpenIdCode();
    }
    if (options.type === "getMiniProgramCode") {
      this.getMiniProgramCode();
    }

    if (options.type === "createCollection") {
      this.getCreateCollectionCode();
    }

    if (options.type === "uploadFile") {
      this.getUploadFileCode();
    }
    this.setData({ type: options?.type, envId: options?.envId });
  },

  copyUrl: function() {
    wx.setClipboardData({
      data: "https://gitee.com/TencentCloudBase/cloudbase-agent-ui/tree/main/apps/miniprogram-agent-ui/miniprogram/components/agent-ui",
      success: function(res) {
        wx.showToast({
          title: "复制成功",
          icon: "success"
        });
      }
    });
  },

  copyPluginName: function() {
    wx.setClipboardData({
      data: "微信云开AI ToolKit",
      success: function(res) {
        wx.showToast({
          title: "复制成功",
          icon: "success"
        });
      }
    });
  },

  copyPrompt: function(e) {
    const prompt = e.currentTarget.dataset.prompt;
    wx.setClipboardData({
      data: prompt,
      success: function(res) {
        wx.showToast({
          title: "复制成功",
          icon: "success"
        });
      }
    });
  },

  insertRecord: function() {
    this.setData({
      showInsertModal: true,
      insertRegion: "",
      insertCity: "",
      insertSales: ""
    });
  },

  deleteRecord: function(e) {
    wx.showLoading({
      title: "删除中.."
    });
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "deleteRecord",
        data: {
          _id: e.currentTarget.dataset.id
        }
      }
    }).then(function(resp) {
      wx.showToast({
        title: "删除成功"
      });
      this.getRecord();
      wx.hideLoading();
    }.bind(this)).catch(function(e) {
      wx.showToast({
        title: "删除失败",
        icon: "none"
      });
      wx.hideLoading();
    });
  },

  onInsertRegionInput: function(e) {
    this.setData({ insertRegion: e.detail.value });
  },

  onInsertCityInput: function(e) {
    this.setData({ insertCity: e.detail.value });
  },

  onInsertSalesInput: function(e) {
    this.setData({ insertSales: e.detail.value });
  },

  onInsertCancel: function() {
    this.setData({ showInsertModal: false });
  },

  onInsertConfirm: function() {
    const insertRegion = this.data.insertRegion;
    const insertCity = this.data.insertCity;
    const insertSales = this.data.insertSales;
    if (!insertRegion || !insertCity || !insertSales) {
      wx.showToast({ title: "请填写完整信息", icon: "none" });
      return;
    }
    wx.showLoading({ title: "插入中.." });
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "insertRecord",
        data: {
          region: insertRegion,
          city: insertCity,
          sales: Number(insertSales)
        }
      }
    }).then(function(resp) {
      wx.showToast({ title: "插入成功" });
      this.setData({ showInsertModal: false });
      this.getRecord();
      wx.hideLoading();
    }.bind(this)).catch(function(e) {
      wx.showToast({ title: "插入失败", icon: "none" });
      wx.hideLoading();
    });
  },

  getOpenId: function() {
    wx.showLoading({
      title: ""
    });
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "getOpenId"
      }
    }).then(function(resp) {
      this.setData({
        haveGetOpenId: true,
        openId: resp.result.openid
      });
      wx.hideLoading();
    }.bind(this)).catch(function(e) {
      wx.hideLoading();
      const errMsg = e.errMsg;
      if (errMsg.includes("Environment not found")) {
        this.setData({
          showTip: true,
          title: "云开发环境未找到",
          content: "如果已经开通云开发，请检查环境ID与miniprogram/app.js中的env参数是否一致"
        });
        return;
      }
      if (errMsg.includes("FunctionName parameter could not be found")) {
        this.setData({
          showTip: true,
          title: "请上传云函数",
          content: "在cloudfunctions/quickstartFunctions目录右键，选择【上传并部署-云端安装依赖】，等待云函数上传完成后重试"
        });
        return;
      }
    }.bind(this));
  },

  clearOpenId: function() {
    this.setData({
      haveGetOpenId: false,
      openId: ""
    });
  },

  clearCallContainerRes: function() {
    this.setData({
      haveGetCallContainerRes: false,
      callContainerResStr: ""
    });
  },

  getCodeSrc: function() {
    wx.showLoading({
      title: ""
    });
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "getMiniProgramCode"
      }
    }).then(function(resp) {
      this.setData({
        haveGetCodeSrc: true,
        codeSrc: resp.result
      });
      wx.hideLoading();
    }.bind(this)).catch(function(e) {
      wx.hideLoading();
      const errMsg = e.errMsg;
      if (errMsg.includes("Environment not found")) {
        this.setData({
          showTip: true,
          title: "云开发环境未找到",
          content: "如果已经开通云开发，请检查环境ID与miniprogram/app.js中的env参数是否一致"
        });
        return;
      }
      if (errMsg.includes("FunctionName parameter could not be found")) {
        this.setData({
          showTip: true,
          title: "请上传云函数",
          content: "在cloudfunctions/quickstartFunctions目录右键，选择【上传并部署-云端安装依赖】，等待云函数上传完成后重试"
        });
        return;
      }
    }.bind(this));
  },

  clearCodeSrc: function() {
    this.setData({
      haveGetCodeSrc: false,
      codeSrc: ""
    });
  },

  bindInput: function(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.record;
    record[index].sales = Number(e.detail.value);
    this.setData({
      record: record
    });
  },

  getRecord: function() {
    wx.showLoading({
      title: ""
    });
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "selectRecord"
      }
    }).then(function(resp) {
      this.setData({
        haveGetRecord: true,
        record: resp.result.data
      });
      wx.hideLoading();
    }.bind(this)).catch(function(e) {
      this.setData({
        showTip: true
      });
      wx.hideLoading();
    }.bind(this));
  },

  clearRecord: function() {
    this.setData({
      haveGetRecord: false,
      record: []
    });
  },

  updateRecord: function() {
    wx.showLoading({
      title: ""
    });
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "updateRecord",
        data: this.data.record
      }
    }).then(function(resp) {
      wx.showToast({
        title: "更新成功"
      });
      wx.hideLoading();
    }.bind(this)).catch(function(e) {
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    }.bind(this));
  },

  uploadImg: function() {
    wx.showLoading({
      title: ""
    });
    wx.chooseMedia({
      count: 1,
      success: function(chooseResult) {
        wx.cloud.uploadFile({
          cloudPath: "my-photo-" + new Date().getTime() + ".png",
          filePath: chooseResult.tempFiles[0].tempFilePath
        }).then(function(res) {
          this.setData({
            haveGetImgSrc: true,
            imgSrc: res.fileID
          });
        }.bind(this)).catch(function(e) {
        });
      }.bind(this),
      complete: function() {
        wx.hideLoading();
      }
    });
  },

  clearImgSrc: function() {
    this.setData({
      haveGetImgSrc: false,
      imgSrc: ""
    });
  },

  goOfficialWebsite: function() {
    const url = "https://docs.cloudbase.net/toolbox/quick-start";
    wx.navigateTo({
      url: "../web/index?url=" + url
    });
  },

  runCallContainer: function() {
    const app = getApp();
    const c1 = new wx.cloud.Cloud({
      resourceEnv: app.globalData.env
    });
    c1.init().then(function() {
      return c1.callContainer({
        path: "/api/users",
        header: {
          "X-WX-SERVICE": "express-test"
        },
        method: "GET"
      });
    }).then(function(r) {
      this.setData({
        haveGetCallContainerRes: true,
        callContainerResStr: JSON.stringify(r.data.items, null, 2)
      });
    }.bind(this));
  },

  getCallcbrCode: function() {
    const app = getApp();
    this.setData({
      callcbrCode: "const c1 = new wx.cloud.Cloud({resourceEnv: " + app.globalData.env + "}); await c1.init(); const r = await c1.callContainer({path: '/api/users', header: {'X-WX-SERVICE': 'express-test'}, method: 'GET'});"
    });
  },

  getInitEnvCode: function() {
    const app = getApp();
    this.setData({
      initEnvCode: "wx.cloud.init({env: " + app.globalData.env + ", traceUser: true});"
    });
  },

  getCreateCollectionCode: function() {
    this.setData({
      callCreateCollectionCode: "const cloud = require('wx-server-sdk'); cloud.init({env: cloud.DYNAMIC_CURRENT_ENV}); const db = cloud.database(); exports.main = function(event, context) { try { db.createCollection('sales'); return {success: true}; } catch (e) { return {success: true, data: 'create collection success'}; } }}"
    });
  },

  getOpenIdCode: function() {
    this.setData({
      callOpenIdCode: "const cloud = require('wx-server-sdk'); cloud.init({env: cloud.DYNAMIC_CURRENT_ENV}); exports.main = function(event, context) { const wxContext = cloud.getWXContext(); return {openid: wxContext.OPENID, appid: wxContext.APPID, unionid: wxContext.UNIONID}; }}",
      callFunctionCode: "wx.cloud.callFunction({name: 'quickstartFunctions', data: {type: 'getOpenId'}}).then(function(resp) {console.log(resp);});"
    });
  },

  getMiniProgramCode: function() {
    this.setData({
      callMiniProgramCode: "const cloud = require('wx-server-sdk'); cloud.init({env: cloud.DYNAMIC_CURRENT_ENV}); exports.main = function(event, context) { const resp = cloud.openapi.wxacode.get({path: 'pages/index/index'}); const buffer = resp.buffer; const upload = cloud.uploadFile({cloudPath: 'code.png', fileContent: buffer}); return upload.fileID; }}",
      callFunctionCode: "wx.cloud.callFunction({name: 'quickstartFunctions', data: {type: 'getMiniProgramCode'}}).then(function(resp) {console.log(resp);});"
    });
  },

  getUploadFileCode: function() {
    this.setData({
      callUploadFileCode: "wx.chooseMedia({count: 1, success: function(chooseResult) {wx.cloud.uploadFile({cloudPath: 'my-photo.png', filePath: chooseResult.tempFiles[0].tempFilePath}).then(function(res) {}).catch(function(e) {});}});"
    });
  }
});
