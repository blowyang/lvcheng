//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，

    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
  },
  onShow: function () {
    console.log("onShow")
    var that = this;
    var shopList = [];
    if ("buykj" == that.data.orderType) {
      if (shopList.length == 0) {
        var buykjInfoMem = wx.getStorageSync('buykjInfo');
        if (buykjInfoMem && buykjInfoMem.shopList) {
          shopList = buykjInfoMem.shopList
        }
      }
    } else {
      //立即购买下单
      if ("buyNow" == that.data.orderType) {

        var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
        if (buyNowInfoMem && buyNowInfoMem.shopList) {
          shopList = buyNowInfoMem.shopList
        }
      } else {
        //购物车下单
        var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
        if (shopCarInfoMem && shopCarInfoMem.shopList) {
          // shopList = shopCarInfoMem.shopList
          shopList = shopCarInfoMem.shopList.filter(entity => {
            return entity.active;
          });
        }
      }
    }

    that.setData({
      goodsList: shopList,
    });
    that.initShippingAddress();
  },

  onLoad: function (e) {
    var that = this;
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  createOrder: function (e) {

    var that = this;
    wx.showLoading();
    var loginToken = app.globalData.token // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      token: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    };
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      postData.provinceId = that.data.curAddressData.provinceId;
      postData.cityId = that.data.curAddressData.cityId;
      if (that.data.curAddressData.districtId) {
        postData.districtId = that.data.curAddressData.districtId;
      }
      postData.address = that.data.curAddressData.address;
      postData.linkMan = that.data.curAddressData.linkMan;
      postData.mobile = that.data.curAddressData.mobile;
      postData.code = that.data.curAddressData.code;
    }
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.id;
    }
    if (!e) {
      postData.calculate = "true";
    }


    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/create',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: postData, // 设置请求的 参数
      success: (res) => {
        wx.hideLoading();
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
        
        if (res.data.code != 0) {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }

        if (e && "buyNow" != that.data.orderType) {
          // 清空购物车数据
          wx.removeStorageSync('shopCarInfo');
        }
        if (!e) {
          that.setData({
            isNeedLogistics: res.data.data.isNeedLogistics,
            allGoodsPrice: res.data.data.amountTotle,
            allGoodsAndYunPrice: res.data.data.amountLogistics + res.data.data.amountTotle,
            yunPrice: res.data.data.amountLogistics
          });
          that.getMyCoupons();
          return;
        }
        // 配置模板消息推送
        var postJsonString = {};
        //订单关闭
        postJsonString.keyword1 = { value: res.data.data.orderNumber, color: '#173177' }
        postJsonString.keyword2 = { value: res.data.data.dateAdd, color: '#173177' }
        postJsonString.keyword3 = { value: res.data.data.amountReal + '元', color: '#173177' }
        postJsonString.keyword4 = { value: '已关闭', color: '#173177' }
        postJsonString.keyword5 = { value: '您可以重新下单，请在30分钟内完成支付', color: '#173177' }
        app.sendTempleMsg(res.data.data.id, -1,
          'rNDYCpswxz1LmoYX1LwnEH92Bw1uYUnjrXuVWP8T2WU', e.detail.formId,
          'pages/classification/index', JSON.stringify(postJsonString), 'keyword4.DATA');
        //付款成功通知
        /**/
        postJsonString = {};
        postJsonString.keyword1 = { value: res.data.data.orderNumber, color: '#173177' }
        postJsonString.keyword2 = { value: res.data.data.dateAdd, color: '#173177' }
        postJsonString.keyword3 = { value: res.data.data.amountReal + '元', color: '#173177' }
        postJsonString.keyword4 = { value: '13952810716', color: '#173177' }
        postJsonString.keyword5 = { value: '付款成功' }
        postJsonString.keyword6 = { value: '您的订单已付款，请联系客服，确认配货时间和地点', color: '#173177' }
        app.sendTempleMsg(res.data.data.id, 1,
          'xlB8KGz0V5mWyGecP6teTWOF0VR3db731OHiw6iPfss', e.detail.formId,
          'pages/ucenter/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString), 'keyword5.DATA');

        //订单已发货待确认通知
        postJsonString = {};
        postJsonString.keyword1 = { value: res.data.data.orderNumber, color: '#173177' }
        postJsonString.keyword2 = { value: res.data.data.dateAdd, color: '#173177' }
        postJsonString.keyword3 = { value: res.data.data.amountReal + '元', color: '#173177' }
        postJsonString.keyword4 = { value: '已发货' }
        postJsonString.keyword5 = { value: '您的订单已发货，请保持手机通常，如有任何问题请联系客服13952810716', color: '#173177' }
        app.sendTempleMsg(res.data.data.id, 2,
          'inirLzp_1A6ZfDwGO-E67_kAmLEnv2HMUvE6vbDmKUg', e.detail.formId,
          'pages/ucenter/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString), 'keyword4.DATA');

        // 下单成功，跳转到订单管理界面
        wx.redirectTo({
          url: "/pages/ucenter/order-list/index"
        });
        //添加搜藏
        
        for (var i=0;i<that.data.goodsList.length;i++){
          var temGoodsId = that.data.goodsList[i].goodsId
          wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/fav/add',
            data: {
              token: app.globalData.token,
              goodsId: temGoodsId
            },
          })
        }      
      }       
    })

  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/default',
      data: {
        token: app.globalData.token
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            curAddressData: res.data.data
          });
        } else {
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },
  processYunfei: function () {
    console.log("processYunfei")
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }
      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    that.createOrder();
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  
  getMyCoupons: function () {
    console.log("getMyCoupons")
    var that = this;
    /**/
    if ("buykj" == that.data.orderType) {
      return
    }

    var goodsList = that.data.goodsList
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/my',
      data: {
        token: app.globalData.token,
        status: 0
      },
      success: function (res) {
        if (res.data.code == 0) {
          var coupons = []
          var temCoupons = res.data.data
          temCoupons = temCoupons.filter(entity => {
            return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
          })
          for (var i = 0; i < temCoupons.length; i++) {
            var coupon = temCoupons[i]
            if (coupon.refId == undefined) {
              coupons.push(coupon)
            }
            var check = false
            for (var j = 0; j < goodsList.length; j++) {
              var goodsId = goodsList[j].goodsId
              if (goodsId == coupon.refId) {
                check = true
              }
            }
            if (check) {
              coupons.push(coupon)
            }
          }
          
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  },
})
