// pages/store/store.js
const app = getApp()

import api from '../../utils/api.js'
let Api = new api();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoading:true,
    moreloading:false,//显示加载loading
    nomore:false,//显示加载完毕
    more:true,//显示加载
    qrcode: '',//客服二维码
    kefuHeadimg:'',//客服头像
    storeName:'',//店铺名字
    shopId:'',//店铺id
    shopPhone:'',//店铺电话
    addr:'',
    addrdescribe:'',
    lat:'',
    lng:'',
    swiperList: [],//轮播
    page:1,
    limit:10,
    syList: [],
  },
  phones:function(e){//拨打电话
    var num=e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: num,
    })
  },
  getserve:function(){//客服和图片路径
    var _this=this
    _this.setData({
      baseUrl:app.globalData.baseUrl
    })
    app.api.getService().then(function (res) {
      _this.setData({
        qrcode:this.data.baseUrl+res.data.services_img,
        kefuHeadimg:this.data.baseUrl+res.data.avatar,
      })
    }.bind(this)).catch(function (err) {
      
    }.bind(this))
  },
  onLoad: function (options) {
    var _this=this
    _this.setData({
      shopId:options.shopId||1
    })
    
  },
  allFun:function(){
    this.getActDetail()
    this.getserve()
    this.getShopsact()
  },
  onShow:function(){
    if (!this.data.baseUrl) {
      app.init().then(() => {
        this.allFun()
      })
    }    
  },
  detail:function(e){
    var _this=this
    
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../product/product?productid=' + id,
    })
  },
  getActDetail:function(data){//店铺详情
    var _this=this
    var data={shop_id:this.data.shopId}
    app.api.getActDetail({data}).then(function (res) {
      _this.setData({
        
        swiperList:res.data.icons,
        storeName:res.data.title,
        shopPhone:res.data.mobile,
        addr:res.data.addr,
        addrdescribe:res.data.addr_describe,
        lat:res.data.lat,
        lng:res.data.lng
      })
      wx.setNavigationBarTitle({
        title: res.data.title
      })
    }.bind(this)).catch(function (err) {
      if(err.data.status_code==401){
        wx.login({
          success: (res) => {
            Api.getToken({
                code: res.code
              }).then(res => {
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
  getShopsact:function(data){//获取商家店铺活动列表
    var _this=this
    var data={
      shop_id:this.data.shopId,
      page:this.data.page,
      limit:this.data.limit
    }
    app.api.getShopsact({data}).then(function (res) {
      var syList=this.data.syList,newlist=res.data
      var concatList=syList.concat(newlist)
      _this.setData({
        showLoading:false,
        syList:concatList,
        moreloading:false,
      })
      if(res.data.length<10){
        _this.setData({
          nomore:true,
          more:false,
          moreloading:false
        })
      }else{
        _this.setData({
          more:true,
          moreloading:false
        })
      }
      
    }.bind(this)).catch(function (err) {
      if(err.data&&err.data.status_code){
        app.init().then(() => {
          this.onShow()
        })
      }
    }.bind(this))
  },
  onReachBottom: function () {
    var _this=this
    if(this.data.nomore!=true){
      _this.setData({
        moreloading:true,
        more:false,
        page:this.data.pageNum++
      })
      this.getShopsact()
    }else{
      _this.setData({
        moreloading:false
       
      })
    }
    
    
  },
  map:function(){
   
    wx.openLocation({
      latitude: Number(this.data.lat),
      longitude:Number(this.data.lng) ,
      scale: 18,
      name: this.data.storeName,
      address: this.data.addr+this.data.addrdescribe
    })
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})