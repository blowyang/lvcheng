var rootDocment = 'https://api.it120.cc';//你的域名  
function req(url, params, cb) {
  wx.request({
    url: rootDocment + url,
    data: params,
    dataType: "json",
    method: 'GET',
    header: { 'Content-Type': 'application/json' },
    success: function (res) {
      return typeof cb == "function" && cb(res.data)
    },
    fail: function () {
      return typeof cb == "function" && cb(false)
    }
  })
}
function request(url, params, cbs,cbf) {
  wx.request({
    url: rootDocment + url,
    data: params,
    dataType: "json",
    method: 'GET',
    header: { 'Content-Type': 'application/json' },
    success: function (res) {
      return typeof cbs == "function" && cbs(res.data)
    },
    fail:function(res){
      return typeof cbf == "function" && cbf(res.data)
    }
  })
}

module.exports = {
  req: req,
  request: request
}  