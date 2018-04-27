//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    id: null,//商品id
    share: 0,
    userID: 0,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,

    kanjiashare: true,//发起砍价 or 邀请好友砍价弹窗
    helpkanjiashare: true,//受邀砍价弹窗
    victorykanjia: true, //砍价成功弹窗
    postershow: true, //生成海报弹窗

    x: 0,
    y: 0,
    hidden: true,
    OriPrice:0, //原价
    curPricese:0,//当前价
    onPrice:0,//已砍
    getPrice:0,//还差
  },

  //砍价弹窗
  kanjiashow: function () {
    this.setData({
      kanjiashare: false
    })
  },
  closevictory: function () {
    this.setData({
      victorykanjia: true
    })
  },
  //发起砍价 or 邀请好友砍价弹窗
  getshare: function () {
    this.setData({
      kanjiashare: false
    })
  },
  //关闭发起砍价 or 关闭邀请好友砍价弹窗
  closeShare: function () {
    this.setData({
      kanjiashare: true,
    })
  },
  //关闭受邀砍价弹窗
  closeHelp: function () {
    this.setData({
      helpkanjiashare: true,
    })
  },
  //生成海报弹窗
  showposter: function () {
    this.setData({
      kanjiashare: true,
      postershow: false,
    });
    wx.showModal({
      title: '温馨提示',
      content: '您可以截图进行保存\r\n点击任意界面即可关闭海报',
      confirmText: '我知道了',
      showCancel: false
    });
  },
  //保存海报并关闭弹窗
  saveposter: function (e) {
    this.setData({
      postershow: true,
    })
  },
  onLoad: function (e) {
    var that = this;/*
    //用户不授权，则提示不能参与砍价，再次发起授权
    if (!app.globalData.token) {
      wx.showModal({
        title: '温馨提示',
        content: '您必须要授权才能正常参与或发起砍价～',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            that.login()
          }
        }
      })
    }*/
    if (!e.id) { //扫码进入
      var scene = decodeURIComponent(e.scene);
      if (scene.length > 0 && scene != undefined) {
        var scarr = scene.split(',');
        var dilist = [];
        for (var i = 0; i < scarr.length; i++) {
          dilist.push(scarr[i].split('='))
        }
        if (dilist.length > 0) {
          var dict = {};
          for (var j = 0; j < dilist.length; j++) {
            dict[dilist[j][0]] = dilist[j][1]
          }
          that.data.id = dict.i;
          that.data.kjId = dict.k;
          that.data.joiner = dict.j;
          that.data.share = dict.s;
        }
      }
      if (dict.s == 1) {
        setTimeout(function () {
          that.setData({
            helpkanjiashare: false
          })
        }, 800
        )
      }
    } 
    if (!e.scene) { //链接进入
      that.data.id = e.id;
      that.data.kjId = e.kjId;
      that.data.joiner = e.joiner;
      that.data.share = e.share;
      if (e.share == 1) {
        setTimeout(function () {
          that.setData({
            helpkanjiashare: false
          })
        }, 800
        )
      }
    }
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/list',
      success: function (res) {
        for (var i = 0; i < res.data.data.result.length; i++) {
          if (res.data.data.result[i].goodsId == that.data.id) {
            that.setData({
              EndTime: res.data.data.result[i].dateEnd,
              OriPrice: res.data.data.result[i].originalPrice,
            });
          }
        }
      }
    })
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
      data: {
        id: that.data.id
      },
      success: function (res) {
        that.setData({
          goodsDetail: res.data.data,
        });
      }
    })
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/qrcode/wxa/unlimit',
      data: {
        scene: "k=" + that.data.kjId + ",j=" + that.data.joiner + ",i=" + that.data.id + ",s=1",
        page: "pages/kanjia/index"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            codeimg: res.data.data
          });
        }
      }
    })
    setTimeout(function () {//延迟执行，否则会获取不到正确的砍价金额
      that.setData({ userID: app.globalData.uid });//用户ID
      that.getKanjiaInfo(that.data.kjId, that.data.joiner);
      that.getKanjiaInfoMyHelp(that.data.kjId, that.data.joiner);
    }, 300)
  },
  //下拉刷新砍价人数
  onPullDownRefresh: function () {
    var that = this;
    var kjId = that.data.kjId;
    var joiner = that.data.joiner;

    that.getKanjiaInfo(kjId, joiner);
    wx.stopPullDownRefresh();
  },
  getgoods: function () {
    var that = this;
    wx.navigateTo({
      url: "/pages/kanjia-goods/index?id=" + that.data.id
    })
  },
  getkanjia: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
      data: {
        kjid: that.data.kjId,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.navigateTo({
            url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId
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
  onShareAppMessage: function () {
    var that = this;
    that.setData({
      kanjiashare: true
    });
    return {
      title: "我发现一件好货，来帮我砍价吧～",
      path: "/pages/kanjia/index?kjId=" + that.data.kjId + "&joiner=" + that.data.joiner + "&id=" + that.data.id + "&share=1",
      success: function (res) {
        // 转发成功
        that.setData({
          kanjiashare: true
        });
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getKanjiaInfo: function (kjid, joiner) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/info',
      data: {
        kjid: kjid,
        joiner: joiner,
      },
      success: function (res) {
        var shareId = that.data.share;
        if (res.data.code != 0) {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        if (res.data.data.kanjiaInfo.helpNumber == 0 && shareId != 1) {
          setTimeout(function () {
            that.setData({
              kanjiashare: false
            });
          }, 800
          )
        }
        if (res.data.code == 0){   //
          var getPrice = (res.data.data.kanjiaInfo.curPrice - res.data.data.kanjiaInfo.minPrice).toFixed(2) //计算还差结果保留2位小数
          that.setData({
            kanjiaInfo: res.data.data,
            curPricese: res.data.data.kanjiaInfo.curPrice,
            minPricese: res.data.data.kanjiaInfo.minPrice,
            getPrice: getPrice
          });
          var onPrice = (that.data.OriPrice - that.data.curPricese).toFixed(2)  //计算已砍结果保留2位小数
          that.setData({
            onPrice: onPrice,
          });
        }
      }
    })
  },
  getKanjiaInfoMyHelp: function (kjid, joiner) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/myHelp',
      data: {
        kjid: kjid,
        joinerUser: joiner,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            kanjiaInfoMyHelp: res.data.data
          });
        }
      }
    })
  },
  helpKanjia: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/help',
      data: {
        kjid: that.data.kjId,
        joinerUser: that.data.joiner,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code != 0) {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        that.setData({
          mykanjiaInfo: res.data.data,
          helpkanjiashare: true,
          victorykanjia: false
        });
        that.getKanjiaInfo(that.data.kjId, that.data.joiner);
        that.getKanjiaInfoMyHelp(that.data.kjId, that.data.joiner);
      }
    })
  },
  gopay: function () {
    var id = this.data.id;
    console.log('yang')
    console.log(app.globalData.uid)
    var buykjInfo = this.buliduBuykjInfo();
    wx.setStorage({
      key: "buykjInfo",
      data: buykjInfo
    })

    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buykj"
    })
  },
  buliduBuykjInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.kanjiaInfo.kanjiaInfo.curPrice//this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = 1//this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;
    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
})
