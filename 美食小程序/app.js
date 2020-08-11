//app.js
import api from './utils/api.js'
let Api = new api();
Api._baseUrl = "https://mini.hnchanggeng.com/api/"
App({
  onLaunch: function () {
  },
  init() {
    let _this = this;
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success(res) {
          // if (!res.authSetting['scope.userInfo']) {
          //   wx.navigateTo({
          //     url: '/pages/authorize/index'
          //   })
          // } else {
            wx.login({
              success: (res) => {
                let token = wx.getStorageSync('token');
                let baseUrl = wx.getStorageSync('base_url');
                if (!token) {
                  Api.getToken({
                    code: res.code
                  }).then(res => {
                    _this.globalData.token = res.data.token.token;
                    _this.globalData.baseUrl = res.data.base_url;
                   
                    Api._request._header['token'] = _this.globalData.token;
                    wx.setStorageSync('token', _this.globalData.token)
                    wx.setStorageSync('base_url', res.data.base_url)
                    resolve();
                  }).catch(err => {
                    reject(err)
                  })
                }else{
                  _this.globalData.token = token;
                  _this.globalData.baseUrl = baseUrl;
                  Api._request._header['token'] = token;
                  resolve()
                }
              }
            })
          //}
        },
        fail: (err) => {
          console.log(err)        
        }
      })
    })
  },
  api: Api,
  globalData: {
    token: "",
    userInfo: null,
    baseUrl: ''
    
  }
})