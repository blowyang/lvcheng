//index.js
//获取应用实例
var starscore = require("../../templates/starscore/starscore.js");
var WxSearch = require('../../templates/wxSearch/wxSearch.js');
var app = getApp()
Page({
  data: {
    page:1,
    pageSize:10000,
    searchInput:'',
    loadingHidden: false, // loading
    userInfo: {},
    categories: [],
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: false,
    hasNoCoupons: true,
    couponsTitlePicStr:'',
    coupons: [],
    kanjialist: [],
    goodsid: [],
    pics: {}
  },
  wxSearchFn: function (e) {
    var that = this
    that.toSearch(e);
    WxSearch.wxSearchAddHisKey(that);

  },
  wxSearchInput: function (e) {
    var that = this
    WxSearch.wxSearchInput(e, that);

    that.setData({
      keyword: that.data.wxSearchData.value,
    })
  },
  wxSerchFocus: function (e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function (e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function (e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);

    that.setData({
      keyword: that.data.wxSearchData.value,
    })
  },
  wxSearchDeleteKey: function (e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function (e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function (e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading()
    that.onLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/finder/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onLoad: function () {
    var that = this
    //初始化的时候渲染wxSearchdata 第二个为你的search高度
    WxSearch.init(that, 43, app.globalData.hotGoods);
    WxSearch.initMindKeys(app.globalData.goodsName);  //获取全部商品名称，做为智能联想输入库
    that.getCouponsTitlePicStr();   
    that.getCoupons();
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/list',
      success: function (res) {
        var goodsid = [];
        var kanjialist = [];
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.result.length; i++) {
            goodsid.push(res.data.data.result[i].goodsId)
            that.getgoods(res.data.data.result[i].goodsId)
          }
          kanjialist = res.data.data.result
        }
        that.setData({
          kanjialist: kanjialist,
          goodsid: goodsid
        });
      },
    })
  },
  getgoods: function (id) {
    var that = this
    var pics = that.data.pics
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
      data: {
        id: id
      },
      success: function (res) {
        if (res.data.code == 0) {

          pics[id] = res.data.data.basicInfo
          that.setData({
            pics: pics,
          });
        }
      }
    })
  },
  getCouponsTitlePicStr: function () {
    var that = this;
    //  获取商城名称
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'couponsTitlePicStr'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            couponsTitlePicStr: res.data.data.value
          })
          
        }
      },
      fail: function () {
        
      },
    })
  },
  //事件处理函数
  listenerSearchInput: function (e) {
    this.setData({
      keyword: e.detail.value
    })
    
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  toSearch: function (e) {
    wx.navigateTo({
      url: '/pages/search/index?keyword=' + this.data.keyword,
    })
  },
  
  getCoupons: function () {
    wx.showLoading({
      title: '获取优惠券中···',
    })
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data
          });
          wx.showToast({
            title: '完成',
          })
        } else if (res.data.code == 700) {
          that.setData({
            hasNoCoupons: true,
            coupons: res.data.data
          });
          wx.showToast({
            title: '暂无优惠券可领',
          })
        }
      },
      fail: function(res) {
        
      }
    })
  },
  gitCoupon: function (e) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '你领过了，别贪心哦~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 30001) {
          wx.showModal({
            title: '错误',
            content: '您的积分不足',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '错误',
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 10000) {
          
          wx.switchTab({
            url: '/pages/ucenter/index/index',
            success: function () {
              wx.showToast({
                title: '请登录',
                icon: 'success',
                duration: 2000
              })
            }
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功，赶紧去下单吧~',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  //这里是跳转砍价商品详情页
  gokj: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/kanjia-goods/index?id=" + id

    })
  },
})
