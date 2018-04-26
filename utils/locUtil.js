var city = require('city.js');
function getDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = toRadians(lat1);
  var radLat2 = toRadians(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRadians(lng1) - toRadians(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;

  function toRadians(d) { return d * Math.PI / 180; }
} 
function getPlaceId(provinceName,cityName,districtName){
  var provinces=city.cityData
  
  
  for (var i=0;i<provinces.length;i++){
    var province_=provinces[i]
    if (province_.name == provinceName){
      var provinceId = province_.id
      var citys=province_.cityList
      for(var i=0;i<citys.length;i++){
        var city_=citys[i]
        if (city_.name == cityName){
          var cityId=city_.id
          var districts=city_.districtList
          for(var i=0;i<districts.length;i++){
            var district_ = districts[i]
            if (district_.name == districtName){
              var districtId = district_.id
              var placeId =new Object()
              placeId.provinceId = provinceId
              placeId.cityId = cityId
              placeId.districtId = districtId
              return placeId
            }
          }
        }
      }
    }
  }
  
}
module.exports = {
  getDistance: getDistance,
  getPlaceId: getPlaceId
}  