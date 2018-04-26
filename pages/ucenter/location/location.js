var countTooGetLocation = 0;
var total_micro_second = 0;
var starRun = 0;
var totalSecond  = 0;
var oriMeters = 0.0;

var app = getApp();
var amapFile = require('../../../libs/amap-wx.js');
var config = require('../../../libs/config.js');
/* 毫秒级倒计时 */
function count_down(that) {

    if (starRun == 0) {
      return;
    }

    if (countTooGetLocation >= 100) {
      var time = date_format(total_micro_second);
      that.updateTime(time);
    }

  	if (countTooGetLocation >= 5000) { //1000为1s
        that.getLocation();
        countTooGetLocation = 0;
  	}   
    

 setTimeout
  	setTimeout(function(){
		countTooGetLocation += 10;
    total_micro_second += 10;
		count_down(that);
    }
    ,10
    )
}


// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  	// 秒数
  	var second = Math.floor(micro_second / 1000);
  	// 小时位
  	var hr = Math.floor(second / 3600);
  	// 分钟位
  	var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  	// 秒位
	var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;


	return hr + ":" + min + ":" + sec + " ";
}


function getDistance(lat1, lng1, lat2, lng2) { 
    var dis = 0;
    var radLat1 = toRadians(lat1);
    var radLat2 = toRadians(lat2);
    var deltaLat = radLat1 - radLat2;
    var deltaLng = toRadians(lng1) - toRadians(lng2);
    var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    return dis * 6378137;

    function toRadians(d) {  return d * Math.PI / 180;}
} 

function fill_zero_prefix(num) {
	return num < 10 ? "0" + num : num
}

//****************************************************************************************
//****************************************************************************************

Page({
  data: {
    clock: '',
    isLocation:false,
    tglatitude: 31.94479,
    tglongitude: 119.1668,
    latitude: 0,
    longitude: 0,
    markers: [],
    covers: [],
    meters: 0.00,
    time: "0:00:00",
    shopname:'海鲜盛宴：馆陶县文卫街西段名都花园门面房',
    tel:'13952810716',
    name:'杨先生'
  },

//****************************
  onLoad:function(options){
    var that=this
    // 页面初始化 options为页面跳转所带来的参数
    //this.getTgLocation()
    var shopLogo = app.globalData.shopLogo
    var shopId = app.globalData.shopId
    var shopname = app.globalData.shopname
    var shopaddress = app.globalData.shopaddress
    var shoplatitude = app.globalData.shoplatitude
    var shoplongitude = app.globalData.shoplongitude
    var distance = app.globalData.distance 
    var distance_ = distance / 1000
    var meters = new Number(distance_);
    var showMeters = meters.toFixed(2);
    var marker = {
      latitude: shoplatitude,
      longitude: shoplongitude,
      iconPath: "/images/location_red_blue.png",
    };
    var oriCovers = that.data.covers;
    //console.log(oriCovers)
    oriCovers.push(marker)
    //console.log(oriCovers)
    that.setData({
      latitude: shoplatitude,//res.latitude,
      longitude: shoplongitude,//res.longitude
      markers: oriCovers,
      covers: oriCovers,
      meters: showMeters,
      tglatitude: shoplatitude,
      tglongitude: shoplongitude,
      shopname: shopname+':'+shopaddress
    })
    
    //console.log("onLoad")
    count_down(this);
  },
  //****************************
  openLocation:function (){
    var that = this
    console.log(that.data.tglatitude),
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res){
          wx.openLocation({
            latitude: res.latitude, // 纬度，范围为-90~90，负数表示南纬
            longitude: res.longitude, // 经度，范围为-180~180，负数表示西经
            scale: 18, // 缩放比例
          })
      },
    })
  },
  openTgLocation: function () {
    var that = this
    console.log(that.data.tglatitude),
    wx.openLocation({
      latitude: that.data.tglatitude,
      longitude: that.data.tglongitude,
      scale: 18, // 缩放比例
    })
  },


//****************************
  starRun :function () {
    if (starRun == 1) {
      return;
    }
    starRun = 1;
    count_down(this);
    this.getLocation();
  },


 //****************************
  stopRun:function () {
    starRun = 0;
    count_down(this);
  },


//****************************
  updateTime:function (time) {

    var data = this.data;
    data.time = time;
    this.data = data;
    this.setData ({
      time : time,
    })

  },


//****************************
  getLocation:function () {
    console.log("getLocation!.....")
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res){
        console.log("res----------")
        console.log(res)
        //make datas 
        var newCover = {
            latitude: res.latitude,
            longitude: res.longitude,
          };
        var oriCovers = that.data.covers;
        
        console.log("oriMeters----------")
        console.log(oriMeters);
        var len = oriCovers.length;
        var lastCover;
        if (len == 0) {
          oriCovers.push(newCover);
        }
        len = oriCovers.length;
        var lastCover = oriCovers[len-1];
        
        console.log("oriCovers----------")
        console.log(oriCovers,len);

        var newMeters = getDistance(lastCover.latitude,lastCover.longitude,res.latitude,res.longitude)/1000;
        
        if (newMeters < 0.0015){
            newMeters = 0.0;
        }

        oriMeters = oriMeters + newMeters; 
        console.log("newMeters----------")
        console.log(newMeters);


        var meters = new Number(oriMeters);
        var showMeters = meters.toFixed(2);

        oriCovers.push(newCover);
        
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [],
          covers: oriCovers,
          meters:showMeters,
        });
      },
    })
  },
  /*
  getTgLocation: function () {
    var that = this
    /*
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var shopId = app.globalData.shopId
        //找到店面后更新店面信息shopLogo
        if (shopId !== null) {
          app.func.req('/zhiwei/shop/subshop/detail', { id: shopId }, function (detail) {
            var shop = detail.data
            var latitude_ = shop.latitude
            var longitude_ = shop.longitude
            var newCover = {
              latitude: latitude_,
              longitude: longitude_,
              iconPath: "/images/location_red_blue.png",
            };
            var distance_ = app.func.getDistance(latitude_, longitude_, latitude, longitude)/1000
            if (distance_ < 0.0015) {
              distance_ = 0.0;
            }
            var meters = new Number(distance_);
            var showMeters = meters.toFixed(2);
            var oriCovers = that.data.covers;
            console.log(oriCovers)
            oriCovers.push(newCover)
            console.log(oriCovers)
            that.setData({
              latitude: latitude_,//res.latitude,
              longitude: longitude_,//res.longitude
              markers: oriCovers,
              covers: oriCovers,
              meters: showMeters,
              tglatitude: latitude_,
              tglongitude: longitude_,
            })
          })
        }
      }
    })
    

   

    var key = config.Config.key;
    var myAmapFun = new amapFile.AMapWX({ key: key });
    myAmapFun.getRegeo({
      success:function(geo){
        //获取我所在位置
        var latitude = geo[0].latitude
        var longitude = geo[0].longitude
        var province = geo[0].regeocodeData.addressComponent.province;
        var city = geo[0].regeocodeData.addressComponent.city;
        var district = geo[0].regeocodeData.addressComponent.district;
        var placeId = app.func.getPlaceId(province, city, district)
        var params = new Object()
        params.provinceId = placeId.provinceId
        params.cityId = placeId.cityId
        params.districtId = placeId.districtId
        //获取所在位置所在区的店面，并找到最近店面
        var shopId = null
        app.func.req('/zhiwei/shop/subshop/list', params, function (res) {
          var shops = res.data
          if (shops.length > 1) {
            shopId = shops[0].id
            var latitude_ = shops[0].latitude
            var longitude_ = shops[0].longitude
            var distance = app.func.getDistance(latitude, longitude, latitude_, longitude_)
            for (var i = 1; i < shops.length; i++) {
              var shop = shops[i]
              var latitude_ = shop.latitude
              var longitude_ = shop.longitude
              var distance_ = app.func.getDistance(latitude, longitude, latitude_, longitude_)
              if (distance_ < distance) {
                shopId = shop.id
                distance = distance_
              }
            }
          }
          if (shops.length == 1) {
            shopId = shops[0].id
          }
          //找到店面后更新店面信息shopLogo
          if (shopId !== null) {
            app.func.req('/zhiwei/shop/subshop/detail', { id: shopId }, function (detail) {
              var shop = detail.data
              var shopname_ = shop.name + ':' + shop.address
              var latitude_ = shop.latitude
              var longitude_ = shop.longitude
              var newCover = {
                latitude: latitude_,
                longitude: longitude_,
                iconPath: "/images/location_red_blue.png",
              };
              var distance_ = app.func.getDistance(latitude, longitude, latitude_, longitude_)/1000
              if (distance_ < 0.0015) {
                distance_ = 0.0;
              }
              var meters = new Number(distance_);
              var showMeters = meters.toFixed(2);
              var oriCovers = that.data.covers;
              console.log(oriCovers)
              oriCovers.push(newCover)
              console.log(oriCovers)
              that.setData({
                latitude: latitude_,//res.latitude,
                longitude: longitude_,//res.longitude
                markers: oriCovers,
                covers: oriCovers,
                meters: showMeters,
                tglatitude: latitude_,
                tglongitude: longitude_,
                shopname: shopname_
              })
            })
          }
        })
      }
    })
    /* 
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {

        console.log("res----------")
        console.log(res)
        //make datas 
        var newCover = {
          latitude: that.data.tglatitude,
          longitude: that.data.tglongitude,
          iconPath: "/images/location_red_blue.png",
        };

        var newMeters = getDistance(newCover.latitude, newCover.longitude, res.latitude, res.longitude) / 1000;
        if (newMeters < 0.0015) {
          newMeters = 0.0;
        }
        console.log("newMeters----------")
        console.log(newMeters);
        var meters = new Number(newMeters);
        var showMeters = meters.toFixed(2);
        var oriCovers = that.data.covers;
        oriCovers.push(newCover);
        console.log("oriCovers----------")
        console.log(oriCovers);

        that.setData({
          latitude: that.data.tglatitude,//res.latitude,
          longitude: that.data.tglongitude,//res.longitude,
          markers: oriCovers,
          covers: oriCovers,
          meters: showMeters
        });
      },
    })
    
  }
  */
/****************************
  getTgLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        
        console.log("res----------")
        console.log(res)
        //make datas 
        var newCover = {
          latitude: that.data.tglatitude,
          longitude: that.data.tglongitude,
          iconPath: "/images/location_red_blue.png",
        };

        var newMeters = getDistance(newCover.latitude, newCover.longitude, res.latitude, res.longitude) / 1000;
        if (newMeters < 0.0015) {
          newMeters = 0.0;
        }
        console.log("newMeters----------")        
        console.log(newMeters);
        var meters = new Number(newMeters);
        var showMeters = meters.toFixed(2);
        var oriCovers = that.data.covers;        
        oriCovers.push(newCover);
        console.log("oriCovers----------")
        console.log(oriCovers);

        that.setData({
          latitude: that.data.tglatitude,//res.latitude,
          longitude: that.data.tglongitude,//res.longitude,
          markers: oriCovers,
          covers: oriCovers,
          meters: showMeters
        });
      },
    })
  }
  */
  
})



