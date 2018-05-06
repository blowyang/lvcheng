//app.js
var starscore = require("./templates/starscore/starscore.js");
var http = require('service/http.js')  
var utils = require('utils/locUtil.js')  
var amapFile = require('/libs/amap-wx.js');
var config = require('/libs/config.js');
App({
  onLaunch: function () {
    var that = this;
    //  获取商城名称
    wx.request({
      url: 'https://api.it120.cc/'+ that.globalData.subDomain +'/config/get-value',
      data: {
        key: 'mallName'
      },
      success: function(res) {
        if (res.data.code == 0) {
          wx.setStorageSync('mallName', res.data.data.value);
        }
      }
    })
    that.login()
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/category/all',
      success: function (res) {
        var categories = []; //{ id: 0, name: "全品类" }
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.globalData.categories = categories
        //that.getGoods(0,0);//获取全品类商品
      },
      fail: function () {
        that.globalData.onLoadStatus = false
        wx.hideLoading()
      }
    })
    // 获取砍价设置
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/kanjia/list',
      data: {},
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.kanjiaList = res.data.data.result;
        }
      }
    })
  },
  login : function () {
    var that = this;
    var token = that.globalData.token;
    if (token) {
      
      wx.request({
        url: 'https://api.it120.cc/' + that.globalData.subDomain + '/user/check-token',
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.code != 0) {
            that.globalData.token = null;
            that.login();
          }
        }
      })
      return;
    }
    wx.login({
      success: function (res) {
        wx.request({
          url: 'https://api.it120.cc/'+ that.globalData.subDomain +'/user/wxapp/login',
          data: {
            code: res.code
          },
          success: function(res) {           
            if (res.data.code == 10000) {
              // 去注册
              that.registerUser();
              return;
            }
            if (res.data.code != 0) {
              // 登录错误
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel:false
              })
              return;
            }
            //console.log(res.data.data.token)
            that.globalData.token = res.data.data.token;
            that.globalData.uid = res.data.data.uid;
            
          }
        })
      }
    })
  },
  registerUser: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            var iv = res.iv;
            var encryptedData = res.encryptedData;
            // 下面开始调用注册接口
            wx.request({
              url: 'https://api.it120.cc/' + that.globalData.subDomain +'/user/wxapp/register/complex',
              data: {code:code,encryptedData:encryptedData,iv:iv}, // 设置请求的 参数
              success: (res) =>{
                console.log(res)
                wx.hideLoading();
                that.login();
              }
            })
          }
        })
      }
    })
  },
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString, emphasis_keyword){
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: that.globalData.token, //登录接口返回的登录凭证
        type: 0, //0 小程序 1 服务号
        module: 'order', //所属模块：immediately 立即发送模板消息；order 所属订单模块
        business_id: orderId, //登录接口返回的登录凭证
        trigger: trigger, //module不为immediately时必填，代表对应的【订单】触发的状态
        template_id: template_id, //模板消息ID
        form_id: form_id, //type=0时必填，表单提交场景下，为 submit 事件带上的 formId；支付场景下，为本次支付的 prepay_id
        url: page, //小程序：点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）；服务号：跳转的网页地址
        postJsonString: postJsonString, //模板消息内容
        emphasis_keyword: emphasis_keyword //小程序："keyword1.DATA" 模板需要放大的关键词，不填则默认无放大
      },
      success: (res) => {
        //console.log('*********************');
        //console.log(res.data);
        //console.log('*********************');
      }
    })
  },
  getUserInfo: function (cb) {
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登陆接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
    
  },
  globalData:{
    hotGoods: ['帝王蟹', '龙虾', '银鱼', '鲍鱼', '生蚝'],
    goodsName: ['帝王蟹', '龙虾', '银鱼', '鲍鱼', '生蚝'],
    shoplatitude: 31.960890,
    shoplongitude: 119.179680,
    shopLogo:'https://cdn.it120.cc/apifactory/2018/04/04/0df845c8ffcd8f648e56c3affad157b4.jpg',
    shopId:370,
    shopname:'龙锦新天地店',  
    shopaddress:'句容高级中学对面龙锦新天地',
    distance:null,
    provinceName:'江苏省',
    cityName: '镇江市',
    districtName: '句容市',
    page: 1, //初始加载商品时的页面号
    pageSize: 10000, //初始加载时的商品数，设置为10000保证小商户能加载完全部商品
    categories: [],
    goods: [],
    goodsList: [],
    onLoadStatus: true,
    activeCategoryId: null,    
    userInfo: null,
    subDomain: "zhiwei",// 商城后台id
    version: "1.8",
    shareProfile: '  一次旅行不仅仅是一次出行，而是一个过程，一次发现' // 首页转发的时候术语
  },
  // 根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒
  func: {
    req: http.req,
    request: http.request,
    getDistance: utils.getDistance,
    getPlaceId: utils.getPlaceId
  }  
})
