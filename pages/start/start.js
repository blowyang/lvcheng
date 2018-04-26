//login.js
//获取应用实例
var app = getApp();
var amapFile = require('../../libs/amap-wx.js');
var config = require('../../libs/config.js');
Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {}
  },
  goToIndex: function () {
    wx.switchTab({
      url: '/pages/classification/index',
    });
  },

  onLoad: function () {
    
    var that = this
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
  },
  onShow: function () {
    
  },
  onReady: function () {
    
    var that = this;
    setTimeout(function () {
      that.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) { angle = 14; }
      else if (angle < -14) { angle = -14; }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },
});