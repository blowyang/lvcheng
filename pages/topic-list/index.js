//index.js
//获取应用实例
var starscore = require("../../templates/starscore/starscore.js");
var app = getApp();
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    recommendTitlePicStr: '',
    categories: [],
    activeCategoryId: 0,
    goodsList: [], //按类别的商品
    recommendGoods: [], //推荐商品
    banners: [],
    loadingMoreHidden: true,
    page: 1,  //加载商品时的页数默认为1开始
    pageSize: 10000,  //每页商品数设置为5000确保能全部加载商品
  },

  onLoad: function () {
    var that = this
    that.getNotice();
    wx.setNavigationBarTitle({
      title: '旅程专栏',
    })
    /*
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    */
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/cms/category/list',
      data: {
      },
      success: function (res) {
        //console.log(res.data.data[0].id)
        var topic = []
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].level==1){
              topic.push(res.data.data[i]);
            }          
          }
          
          that.setData({
            topics: topic,
            activecmsid: topic[0].id
          });

        }
        that.gettapList(topic[0].id)
      }
    })
    
  },
  getNotice: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize: 7 },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  tapTopic: function (e) {
    var that=this
    that.setData({
      activecmsid: e.currentTarget.dataset.id
    });
    
    that.gettapList(that.data.activecmsid);
  },
  gettapList: function (cmsid) {
    var that = this;
    var cityName = app.globalData.cityName
    var districtName = app.globalData.districtName
    
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/cms/category/list',
      success:function(res){
        var categorys=[]
        if (res.data.code == 0) {
          for(var i=0;i<res.data.data.length;i++){
            var pid = res.data.data[i].pid
            var categoryName = res.data.data[i].name
            if (pid == cmsid & categoryName== cityName){
              categorys.push(res.data.data[i].id)
            }
          }
        }
        
        if (categorys.length>0){
          for (var j = 0; j < categorys.length;j++){
            wx.request({
              url: 'https://api.it120.cc/' + app.globalData.subDomain + '/cms/news/list',
              data: {
                categoryId: categorys[j]
              },
              success: function (res) {
                var content = [];
                if (res.data.code == 0) {
                  var contentsList = res.data.data
                  var topContent=null
                  for (var i = 0; i < contentsList.length; i++) {
                    var content_ = contentsList[i]
                    var tags = content_.tags.split(',');
                    var checkDistrict=false
                    
                    for (var j=0;j<tags.length;j++){
                      if (districtName==tags[j]){
                        checkDistrict=true
                      }
                    }
                    if (checkDistrict){                      
                      if (content_.title == app.globalData.shopname){
                        topContent=content_
                      }else{
                        content.push(content_);
                      }
                    }
                    
                  }
                  if (topContent!=null){
                    var temContent=[]
                    temContent.push(topContent)
                    for (var j = 0; j < content.length;j++){
                      temContent.push(content[j])
                    }
                    content = temContent
                  }                  
                  if (content.length == 0) {
                    
                    for (var i = 0; i < contentsList.length; i++) {
                      var content_ = contentsList[i]
                      content.push(content_)
                    }
                  }

                }
                that.setData({
                  contents: content
                });
              },
              fail:function(){
                var content = [];
                that.setData({
                  contents: content
                });
              }
            })
          }
        }
      }
    })
    
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/select/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  tapContents: function (e) {
    wx.navigateTo({
      url: "/pages/topic/index?id=" + e.currentTarget.dataset.id
    })
  },
})