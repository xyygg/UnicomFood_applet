// pages/product.js
//获取应用实例
const wxParser = require('../../wxParser/index');
const app = getApp()
import api from '../../utils/api.js'
let Api = new api();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    int:0,
    showLoading:true,
    baseUrl:'',//通用路径
    qrcode:'',//客服
    kefuHeadimg:'',
    swiperList: [],//轮播
    code: '',//验证码
    loginname: '',//登录名
    phone: '',//手机号
    isShow: false,//显示预约按钮和商家
    countTime: 10,//倒计时
    ishowForm: false,//弹层
    productid:'1',//商品id
    shopId:'',//店铺id
    storeImg:'',//店铺图片
    storePhone:'',//店铺电话
    storeName:'',//店铺名称
    content1: '',//详情
    content2: ''//详情
  },
  parse: function () {//详情
    wxParser.parse({
      bind: 'richText1',
      html: this.data.content1,
      target: this,
      enablePreviewImage: true // 禁用图片预览功能
    });
  },
  parse2: function () {//活动须知
    wxParser.parse({
      bind: 'richText2',
      html: this.data.content2,
      target: this,
      enablePreviewImage: true // 禁用图片预览功能
    });
  },
  
  getserve:function(){//客服和图片路径
    var _this=this
    _this.setData({
      baseUrl:app.globalData.baseUrl
    })
    app.api.getService().then(function (res) {//商铺列表
      _this.setData({
        qrcode:this.data.baseUrl+res.data.services_img,
        kefuHeadimg:this.data.baseUrl+res.data.avatar,
        
      })
    }.bind(this)).catch(function (err) {
      
    }.bind(this))
  },
  yuyuePoup: function () { //预约弹窗显示
    var _this=this
    _this.setData({
      ishowForm: true
    })
  },
  actclick:function(e){//详情切换
    var _this=this
    _this.setData({
      int: e.currentTarget.dataset.index
    })
  },
  goIndex:function(){//更多好物
    wx.navigateTo({
      url: '../index/index',
    })
  },
  phones:function(e){//拨打电话
    var num=e.currentTarget.dataset.num
    wx.makePhoneCall({
      phoneNumber: num,
    })
  },
  loginInpt: function (e) {//监听姓名输入
    var _this = this;
    var val = e.detail.value;
    _this.setData({
      loginname: val
    })
  },
  phone: function (e) {//监听手机号输入
    var _this = this;
    var val = e.detail.value;
    _this.setData({
      phone: val
    })
  },
  shopDetail:function(e){
    var _this=this
    console.log(e.currentTarget.dataset.id)
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../store/store?shopId=' + id,
    })
  },
  onLoad: function (options) {
    var _this=this
    _this.setData({
      productid:options.productid||options.scene||1,
      
    })
  },
  allFun(){
    this.getseting(()=>{
      this.getProduct()
      this.getserve()
    })
  },
  onShow(){
    if (!this.data.baseUrl) {
      app.init().then(() => {
        this.allFun()
      })
    }
  },
  
  getseting:function(cb){
    this.getLocation().then(()=>{
      typeof cb =="function" && cb();
    }).catch(err=>{
      wx.showModal({
        title: '请求授权当前位置',
        content: '请确认授权',
        success: function (res) {
          if (res.cancel) {
            wx.showToast({
              title: '拒绝授权',
              icon: 'none',
              duration: 1000
            })
          } else if (res.confirm) {
            wx.openSetting({
              success: function (dataAu) {
                if (dataAu.authSetting["scope.userLocation"] == true) {
                  wx.showToast({
                    title: '授权成功',
                    icon: 'none',
                    duration: 1000
                  })
                  //再次授权，调用wx.getLocation的API
                  typeof cb =="function" && cb();
                } else {
                  wx.showToast({
                    title: '授权失败',
                    icon: 'none',
                    duration: 1000
                  })
                }
              }
            })
          }
        }
      })
    })
   
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  getLocation:function(){
    let _this=this;
    return new Promise((resolve,reject)=>{
      wx.getLocation({
        type:'gcj02',
        success: res => {
          _this.setData({
            lat: res.latitude,
            lng:res.longitude
          })
          resolve(res)
        },
        fail: err =>{
          reject(err)
        }
      })
    })
  },
  getProduct:function(data){
    var _this=this
    var data={act_id:this.data.productid}
    app.api.getProduct({data}).then(function (res) {//活动详情
      
      _this.setData({
        swiperList:res.data.icons,
        content1:res.data.detail,
        content2:res.data.rule||'<view style="text-align:center">暂无信息</view>',
        showLoading:false
      })
      wx.setNavigationBarTitle({
        title: res.data.title
      })
      if(res.data.apply_status==1){//显示预约和店铺
        var datas={shop_id:res.data.shops_id}
        _this.setData({
          isShow:true,
        })
        this.getShopdetail(datas)
      }else{
        _this.setData({
          isShow:false,
        })
      }
      this.parse()
      this.parse2()

    }.bind(this)).catch(function (err) {
      if(err.data.status_code==401){
        wx.login({
          success: (res) => {
            Api.getToken({
                code: res.code
              }).then(res => {
                console.log(res)
                app.globalData.token = res.data.token.token;
                app.globalData.baseUrl = res.data.base_url;
                Api._request._header['token'] = app.globalData.token;
                wx.setStorageSync('token', app.globalData.token)
                wx.setStorageSync('base_url', res.data.base_url)
                app.init().then(() => {
                  this.allFun()
                })
              }).catch(err => {
                console.log(err)
              })
            
          }
        })
      }
    }.bind(this))
  },
  getShopdetail:function(data){//底部店铺信息
    var _this=this
    app.api.getShopdetail({data}).then(function (res) {//活动详情
      _this.setData({
        shopId:res.data.id,
        storeImg:res.data.img,
        storePhone:res.data.mobile,
        storeName:res.data.title
      })
    }.bind(this)).catch(function (err) {
      
    }.bind(this))
  },
  formSubmit: function (e) {//提交
    var _this = this
    if (this.data.loginname == null || this.data.loginname == '') {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(this.data.phone))) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return;
    }
    console.log(this.data.loginname,this.data.phone)
    var data={
      name:this.data.loginname,
      phone:this.data.phone,
      act_id:this.data.productid
    }
    wx.showToast({
      title: '提交中',
      icon: 'loading'
     
    })
    app.api.getFormsub({data}).then(function (res) {//提交预约
      wx.showToast({
        title: '提交成功',
        icon: 'none',
        duration: 2000,
        success: function () {
          _this.setData({
            ishowForm: false
          })
        }
      })
      
     
    }.bind(this)).catch(function (err) {
      wx.showToast({
        title: err.data.message,
        icon: 'none',
        duration: 2000
      })
     
    }.bind(this))

  },
  
  closeLay:function(){
    var _this=this
    _this.setData({
      ishowForm:false
    })
  },
  catchtouchmove() { },
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})