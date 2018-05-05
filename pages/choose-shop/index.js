var commonCityData = require('../../utils/city.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    provinces: [],
    citys: [],
    defaultProvinceCode: 2,
    defaultCityCode: 3,
    defaultCountyCode: 16,
    defaultShopCode: 0,
    districts: [],
    shops:[],
    shopsDetail:[],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selShop:'请先选择区域',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0,
    selShopIndex: 0,
    shopId:0,
    disabled:false
  },
  onLoad: function (e) {
    var that = this;
    that.initCityData(1);
    //得到从上个页面传来的参数
    var shopId = e.shopId;
    that.setData({
      shopId:shopId
    })
    //获得现有店面的详细信息
    app.func.request('/zhiwei/shop/subshop/detail', { id: shopId }, function (res) {
      var shop = res.data
      var provinceId = shop.provinceId
      var cityId= shop.cityId
      var districtId = shop.districtId
      //var districtId = 321112
      var params = new Object()
      params.provinceId =provinceId
      params.cityId = cityId
      params.districtId = districtId
      app.func.request('/zhiwei/shop/subshop/list', params, function (res) {
        
        var shops_=res.data
        var pinkArray = [];
        for(var i=0;i<shops_.length;i++){
          var shop_=shops_[i]
          pinkArray.push(shop_.name);
          if(shop_.id==shopId){
            
            that.setData({
              selShopIndex:i,
              defaultShopCode:i,
              selShop: shop_.name
            })
          }
        }
        that.setData({
          shops: pinkArray,
          shopsDetail: shops_
        });
        
      },function(res){})
      var provinces = commonCityData.cityData
      for (var i = 0; i < provinces.length;i++){
        var province = provinces[i]
        if (province.id == provinceId){
          that.setData({
            selProvinceIndex:i,
            selProvince:province.name,
            defaultProvinceCode:i
          })
          that.initCityData(2, province);
          var citys=province.cityList
          for(var j=0;j<citys.length;j++){
            var city=citys[j]
            if (city.id == cityId){
              that.setData({
                selCity: city.name,
                selCityIndex: j,
                defaultCityCode: j
              })
              that.initCityData(3, city);
              var districts=city.districtList
              for(var k=0;k<districts.length;k++){
                var district=districts[k]
                if (district.id == districtId){
                  that.setData({
                    selDistrict: district.name,
                    selDistrictIndex:k,
                    defaultCountyCode: k,
                  })
                  //获取区域中的店面

                }
              }
            }
          }
        }
      }
    }, function (res) { })

  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function () {
    var that = this;
    var shopId=that.data.shopId
    app.func.request('/zhiwei/shop/subshop/detail', { id: shopId }, function (res) {
      var shop=res.data
      app.globalData.shopId = shop.id
      app.globalData.shopname = shop.name
      app.globalData.shopaddress = shop.address
      app.globalData.shopLogo = shop.pic      
      app.globalData.shoplatitude = shop.latitude
      app.globalData.shoplongitude = shop.longitude 

      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          var distance=app.func.getDistance(latitude, longitude, shop.latitude, shop.longitude )
          app.globalData.distance = distance
        }
      })

      wx.switchTab({
        url: '/pages/classification/index',
        success:function(e){
          var page=getCurrentPages().pop()
          if(page==undefined||page==null) return
          page.reLoad()
        }
      })

    },function(res){
      wx.switchTab({
        url: '/pages/classification/index',
        success: function (e) {
          var page = getCurrentPages().pop()
          if (page == undefined || page == null) return
          page.onLoad()
        }
      })
    })       
  },
  initCityData: function (level, obj) {
    if (level == 1) {
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces: pinkArray
      });
    } else if (level == 2) {
      var pinkArray = [];
      var dataArray = obj.cityList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys: pinkArray
      });
    } else if (level == 3) {
      var pinkArray = [];
      var dataArray = obj.districtList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts: pinkArray
      });
    }
  },
  bindPickerProvinceChange: function (event) {
    var that=this
    var selIterm = commonCityData.cityData[event.detail.value];
    that.setData({
      disabled: true,
      selProvince: selIterm.name,
      selProvinceIndex: event.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0,
      selShop:'请先选择区域',
      selShopIndex:0,
      shops:[],
      shopsDetail: []
    })
    that.initCityData(2, selIterm)
  },
  bindPickerCityChange: function (event) {
    var that = this
    var selIterm = commonCityData.cityData[that.data.selProvinceIndex].cityList[event.detail.value];
    that.setData({
      disabled: true,
      selCity: selIterm.name,
      selCityIndex: event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0,
      selShop: '请先选择区域',
      selShopIndex: 0,
      shops: [],
      shopsDetail: []
    })
    that.initCityData(3, selIterm)
  },
  bindPickerChange: function (event) {
    var that = this
    var selIterm = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      that.setData({
        disabled: true,
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value,
        selShop: '请先选择区域',
        selShopIndex: 0,
        shops: [],
        shopsDetail:[]
      })
    }
    var provinceId = commonCityData.cityData[that.data.selProvinceIndex].id
    var cityId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].id
    var districtId = commonCityData.cityData[that.data.selProvinceIndex].cityList[that.data.selCityIndex].districtList[that.data.selDistrictIndex].id
    var params = new Object()
    params.provinceId = provinceId
    params.cityId = cityId
    params.districtId = districtId
    app.func.request('/zhiwei/shop/subshop/list', params, function (res) {
      if (res.code !== 0) {
        that.setData({
          disabled: true,
          selShop: '该区域暂无服务',
          selShopIndex: 0,
          shops: [],
          shopsDetail: []
        })
        return
      }
      var shops_ = res.data
      var pinkArray = [];
      for (var i = 0; i < shops_.length; i++) {
        var shop_ = shops_[i]
        pinkArray.push(shop_.name);
      }
      that.setData({
        disabled: true,
        shops: pinkArray,
        shopsDetail: shops_,
        selShop: '现在选择酒店',
        selShopIndex: 0,
      });

    }, function (res) { })
  },
  
  
  bindPickerShopChange: function (event) {
    var that=this
    var index=event.detail.value
    var shopsDetail = that.data.shopsDetail
    if (shopsDetail.length>0){      
      var shop = shopsDetail[index]
      var shopId=shop.id
      that.setData({
        shopId:shopId,
        disabled: false,
        selShop: shop.name,
        selShopIndex: index,
        defaultShopCode: index
      })
    }
    
  },
  
})
