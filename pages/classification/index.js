var app = getApp();
var starscore = require("../../templates/starscore/starscore.js");
var amapFile = require('../../libs/amap-wx.js');
var config = require('../../libs/config.js');
Page({
  data: {
    onLoadStatus: true,
    indicatorDots: true,
    loadingHidden: false, // loading
    shopname:'',
    shopLogo: 'https://cdn.it120.cc/apifactory/2017/12/08/13cf50050ade63f957450f19f0edd756.jpg',
    shopPrompt: [],
    shopDelivery: [],
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: null,
    goods: [],
    goodsList: [],
    scrollTop: 0,
    page: 1,
    pageSize: 5000,
    classifyViewed: null,
    width: 0,
    height: 0,
  },
  chooseShop:function(){
    var shopId = app.globalData.shopId
    wx.navigateTo({
      url: "/pages/choose-shop/index?shopId=" + shopId
    })
  },
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading()
    that.reLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onLoad: function (options) {
    console.log("onLoad")
    var that = this
    wx.getSetting({
      success:(res)=>{
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true){
          wx.showModal({
            title: '是否授权获取位置',
            content: '需要获取您的位置，请确认授权，否则将无法显示最近的店面',
            success:function(res){
              if (res.confirm){
                wx.openSetting({
                  success:function(res){
                    if (res.authSetting["scope.userLocation"] == true){
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      that.getNearestShop()
                    }else{
                      wx.showToast({
                        title: '展示默认店面',
                        icon: 'success',
                        duration: 3000
                      })
                      that.reLoad()
                    }
                  }
                })
              }else{
                wx.showToast({
                  title: '展示默认店面',
                  icon: 'success',
                  duration: 3000
                })
                that.reLoad()
              }
            }
          })
        }else{
          //获取最近的店面信息
          //console.log('此前已授权获取位置')
          that.getNearestShop()
          //console.log('此前已经授权获取位置成功')
        }
      },
      fail:(res)=>{
        wx.showToast({
          title: '展示默认店面',
          icon: 'success',
          duration: 3000
        })
        that.reLoad()
      }
    })
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    
    //获取系统信息  
    wx.getSystemInfo({
      //获取系统信息成功，将系统窗口的宽高赋给页面的宽高  
      success: function (res) {
        //console.log(res.windowWidth)
        that.width = res.windowWidth/2.9  //2.6
        that.height = res.windowWidth/2.9  //2.6
      }
    })
    //console.log(this.width, this.height)
  },
  getNearestShop:function(){
    var that=this
    //获取最近的店面信息
    var key = config.Config.key;
    var myAmapFun = new amapFile.AMapWX({ key: key });
    myAmapFun.getRegeo({
      success: function (geo) {
        //获取我所在位置
        var latitude = geo[0].latitude
        var longitude = geo[0].longitude
        var province = geo[0].regeocodeData.addressComponent.province;
        var city = geo[0].regeocodeData.addressComponent.city;
        var district = geo[0].regeocodeData.addressComponent.district;
        app.globalData.provinceName = province
        app.globalData.cityName = city
        app.globalData.districtName = district

        var placeId = app.func.getPlaceId(province, city, district)
        var params = new Object()
        params.provinceId = placeId.provinceId
        params.cityId = placeId.cityId
        params.districtId = placeId.districtId
        //获取所在位置所在区的店面，并找到最近店面

        app.func.request('/zhiwei/shop/subshop/list', params, function (res) {
          var shopname = app.globalData.shopname
          var shopaddress = app.globalData.shopaddress
          var shopLogo = app.globalData.shopLogo
          var shopId = app.globalData.shopId
          var shoplatitude = app.globalData.shoplatitude
          var shoplongitude = app.globalData.shoplongitude
          var distance = app.func.getDistance(latitude, longitude, shoplatitude, shoplongitude)
          if (res.code != 0) {
            app.globalData.distance = distance
            //console.log(distance)
            return
          }
          var shops = res.data

          if (shops.length > 0) {
            for (var i = 0; i < shops.length; i++) {
              var shop = shops[i]
              var temlatitude = shop.latitude
              var temlongitude = shop.longitude
              var temdistance = app.func.getDistance(latitude, longitude, temlatitude, temlongitude)
              if (temdistance < distance) {
                shopId = shop.id
                shopname = shop.name
                shopaddress = shop.address
                shopLogo = shop.pic
                distance = temdistance
                shoplatitude = temlatitude
                shoplongitude = temlongitude
              }
            }
          }

          //找到店面后更新店面信息shopLogo
          app.globalData.shopId = shopId
          app.globalData.shopname = shopname
          app.globalData.shopaddress = shopaddress
          app.globalData.shopLogo = shopLogo
          app.globalData.distance = distance
          app.globalData.shoplatitude = shoplatitude
          app.globalData.shoplongitude = shoplongitude
          //设置参数
          that.setData({
            shopname: app.globalData.shopname,
            categories: app.globalData.categories,
            goods: app.globalData.goods,
            goodsList: app.globalData.goodsList,
            onLoadStatus: app.globalData.onLoadStatus,
            //onLoadStatus: false,
            activeCategoryId: app.globalData.activeCategoryId,
            shopLogo: app.globalData.shopLogo
          })
          //获取商品
          that.reLoad()
        }, function (res) { app.globalData.distance = distance })
      }
    })  

  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + app.globalData.shareProfile,
      path: '/pages/classification/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onShow: function () {
    console.log("onShow")
    var that = this
    //var shopId = app.globalData.shopId
    that.setData({
      shopname: app.globalData.shopname,
      shopLogo: app.globalData.shopLogo
    })
    //that.reLoad()
    that.getPrompt();
    that.getDelivery();
  },
  //onReady生命周期函数，监听页面初次渲染完成  
  onReady: function () {
    //调用canvasClock函数  
    this.canvasClock()
    //对canvasClock函数循环调用  
    this.interval = setInterval(this.canvasClock, 1000)
  },
  tapClassify: function (e) {
    var id = e.target.dataset.id;
    this.setData({
      classifyViewed: id
    });
    //console.log('id:', this.data.classifyViewed)
    var that = this;
    setTimeout(function () {
      for (let i = 0; i < that.data.categories.length; i++) {
        if (id === that.data.categories[i].key) {
          that.setData({
            activeCategoryId: that.data.categories[i].id,
            page: 1,
            scrolltop: 0,
          });
        }
      }

    }, 100);
  },
  //事件处理函数
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  reLoad: function () {
    var that = this
    /*
    wx.showLoading({
      title: '努力加载中···',
      mask: true,
    })*/
   
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/category/all',
      success: function (res) {
        var categories = []; //{ id: 0, name: "全品类" }
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories: categories,
          goods: [],
          page: 1,
        });
        var shopId = app.globalData.shopId
        that.reGetGoods(0, shopId);//获取全品类通货商品
      },
      fail: function () {
        that.setData({
          onLoadStatus: false,
        })
        //wx.hideLoading()
        //console.log('11')
      }
    })
  },
  
  reGetGoods: function (categoryId, shopId) {
    if (categoryId == 0) {
      categoryId = "";
    }

    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list',
      data: {
        page: that.data.page,
        pageSize: that.data.pageSize,
        categoryId: categoryId,
        shopId: 0
      },
      success: function (res) {
        //获得当前商品
        var goods = that.data.goods;

        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            prePageBtn: false,
            nextPageBtn: true,
            toBottom: true
          });          
        }else{
          for (var i = 0; i < res.data.data.length; i++) {
            goods.push(res.data.data[i]);
          }
        }

        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list', //仅为示例，并非真实的接口地址
          data: {
            page: that.data.page,
            pageSize: that.data.pageSize,
            categoryId: categoryId,
            shopId: shopId
          },
          
          success: function (res) {
            if (res.data.code != 0 || res.data.data.length == 0) {
              that.setData({
                prePageBtn: false,
                nextPageBtn: true,
                toBottom: true
              });
            } else {
              for (var i = 0; i < res.data.data.length; i++) {
                goods.push(res.data.data[i]);
              }
            }
            for (let i = 0; i < goods.length; i++) {
              goods[i].starscore = (goods[i].numberGoodReputation / goods[i].numberOrders) * 5
              goods[i].starscore = Math.ceil(goods[i].starscore / 0.5) * 0.5
              goods[i].starpic = starscore.picStr(goods[i].starscore)
            }
            that.setData({
              goods: goods,
            });
            var categories = that.data.categories
            var goodsList = [],
              id,
              key,
              name,
              goodsTemp = []
            for (let i = 0; i < categories.length; i++) {
              id = categories[i].id;
              key = categories[i].key;
              name = categories[i].name;
              goodsTemp = [];
              for (let j = 0; j < goods.length; j++) {
                if (goods[j].categoryId === id) {
                  goodsTemp.push(goods[j])
                }
              }
              goodsList.push({ 'id': id, 'key': key, 'name': name, 'goods': goodsTemp })
              //console.log("你好," + categories[i].name)
            }
            that.setData({
              goodsList: goodsList,
              onLoadStatus: true,
              activeCategoryId: categories[0].id,
            })
            var goodsName=[]
            var hotGoods=[]
            for (var i=0;i<goods.length;i++){
              var good=goods[i]
              goodsName.push(good.name)
              if (good.recommendStatus==1){
                hotGoods.push(good.name)
              }
            }
            app.globalData.goodsName = goodsName
            app.globalData.hotGoods = hotGoods
            app.globalData.goods=goods
            app.globalData.goodsList = goodsList
            //console.log('yang')
            //console.log(app.globalData.goods)
            /*
            wx.showToast({
              title: '所有商品加载完成',
              icon: 'success',
              duration: 1000,
            })*/
          },
          fail:function(){
            that.setData({
              onLoadStatus: false,
            })
            console.log('33')
          }
        })
      },
      fail: function () {
        that.setData({
          onLoadStatus: false,
        })
        console.log('33')
      }
    })
  }, 


  onGoodsScroll: function (e) {
    if (e.detail.scrollTop > 400 && !this.data.scrollDown) {
      this.setData({
        scrollDown: true
      });
    } else if (e.detail.scrollTop < 400 && this.data.scrollDown) {
      this.setData({
        scrollDown: false
      });
    }

    var scale = e.detail.scrollWidth / 570,
      scrollTop = e.detail.scrollTop / scale,
      h = 0,
      classifySeleted,
      len = this.data.goodsList.length;
    this.data.goodsList.forEach(function (classify, i) {
      var _h = 70 + classify.goods.length * (46 * 3 + 20 * 2);
      if (scrollTop >= h - 100 / scale) {
        classifySeleted = classify.id;
      }
      h += _h;
    });
    this.setData({
      activeCategoryId: classifySeleted
    });
  },
  getPrompt: function () {
    var that = this
    //  获取关于我们Title
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'shopPrompt'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            shopPrompt: res.data.data.value
          })
        }
      }
    })
  },
  getDelivery: function () {
    var that = this
    //  获取关于我们Title
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'shopDelivery'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            shopDelivery: res.data.data.value
          })
        }
      }
    })
  },
  canvasClock: function () {
    var context = wx.createCanvasContext(this.canvasId, this)//创建并返回绘图上下文（获取画笔）  
    //设置宽高  
    var width = this.width
    var height = this.height
    var R = width / 4.5;//设置文字距离时钟中心点距离  
    //重置画布函数  
    function reSet() {
      context.height = context.height;//每次清除画布，然后变化后的时间补上  
      context.translate(width/2.9, height/2.9);//设置坐标轴原点  
      context.save();//保存中点坐标1  
    }
    //绘制中心圆和外面大圆  
    function circle() {
      //外面大圆  
      /*context.setLineWidth(1);
      context.beginPath();
      context.arc(0, 0, width / 2 - 30, 0, 2 * Math.PI, true);
      context.closePath();
      context.stroke();*/
      //中心圆  
      context.beginPath();
      context.arc(0, 0, 1.5, 0, 2 * Math.PI, true);
      context.closePath();
      context.stroke();
    }
    //绘制字体  
    function num() {
      // var R = width/2-60;//设置文字距离时钟中心点距离  
      context.setFontSize(width/14)//设置字体样式  
      context.textBaseline = "middle";//字体上下居中，绘制时间  
      for (var i = 1; i < 13; i++) {
        //利用三角函数计算字体坐标表达式  
        var x = R * Math.cos(i * Math.PI / 6 - Math.PI / 2);
        var y = R * Math.sin(i * Math.PI / 6 - Math.PI / 2);
        if (i == 11 || i == 12) {//调整数字11和12的位置  
          context.fillText(i, x - width/23, y + width/30);
        } else if (i == 10) {//调整数字10的位置
          context.fillText(i, x - width/25, y + width/35);
        }
        else {
          context.fillText(i, x - width/45, y + width/48);
        }
      }
    }
    //绘制小格  
    function smallGrid() {
      context.setLineWidth(0.5);
      context.rotate(-Math.PI / 2);//时间从3点开始，倒转90度  
      for (var i = 0; i < 60; i++) {
        context.beginPath();
        context.rotate(Math.PI / 30);
        context.moveTo(width / 3.425, 0);
        context.lineTo(width / 3.75, 0);
        context.stroke();
      }
    }
    //绘制大格  
    function bigGrid() {
      context.setLineWidth(1);
      for (var i = 0; i < 12; i++) {
        context.beginPath();
        context.rotate(Math.PI / 6);
        context.moveTo(width / 3.42, 0);
        context.lineTo(width / 3.85, 0);
        context.stroke();
      }
    }
    //指针运动函数  
    function move() {
      var t = new Date();//获取当前时间  
      var h = t.getHours();//获取小时  
      h = h > 12 ? (h - 12) : h;//将24小时制转化为12小时制  
      var m = t.getMinutes();//获取分针  
      var s = t.getSeconds();//获取秒针  
      context.save();//再次保存2  
      //旋转角度=30度*（h+m/60+s/3600）  
      //分针旋转角度=6度*（m+s/60）  
      //秒针旋转角度=6度*s  

      //绘制时针  
      context.setLineWidth(1.2);
      context.beginPath();
      context.rotate((Math.PI / 6) * (h + m / 60 + s / 3600));
      context.moveTo(-width / 24, 0);//指针开始位置
      context.setLineCap('round')
      context.lineTo(width / 9, 0);//指针结束位置，可以决定指针长度
      context.stroke();
      context.restore();//恢复到2,（最初未旋转状态）避免旋转叠加  
      context.save();//3  
      //画分针  
      context.setLineWidth(0.8);
      context.beginPath();
      context.rotate((Math.PI / 30) * (m + s / 60));
      context.moveTo(-width / 24, 0);
      context.lineTo(width / 7.2, 0);
      context.stroke();
      context.restore();//恢复到3，（最初未旋转状态）避免旋转叠加  
      context.save();
      //绘制秒针  
      context.setLineWidth(0.5);
      context.beginPath();
      context.rotate((Math.PI / 30) * s);
      context.moveTo(-width/24, 0);
      context.lineTo(width / 6.2, 0);
      context.stroke();
    }
    //调用  
    function drawClock() {
      reSet();
      circle();
      num();
      smallGrid();
      bigGrid();
      move();
    }
    drawClock()//调用运动函数  
    // 调用 wx.drawCanvas，通过 canvasId 指定在哪张画布上绘制，通过 actions 指定绘制行为  
    wx.drawCanvas({
      canvasId: 'myCanvas',
      actions: context.getActions()
    })
  },
  //页面卸载，清除画布绘制计时器  
  onUnload: function () {
    clearInterval(this.interval)
  }
});

