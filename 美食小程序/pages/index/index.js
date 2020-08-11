//index.js
//获取应用实例
const app = getApp()
import api from '../../utils/api.js'
let Api = new api();
Page({
  data: {
    showLoading:true,
    moreloading: false,//显示加载loading
    nomore: false,//显示加载完毕
    more: true,//显示加载
    qrcode: '',//客服二维码
    kefuHeadimg:'',//客服头像
    currentIndex:0,
    iconshow:true,
    show: false,
    lat:'',//纬度
    lng:'',//经度
    pageNum:1,
    catId:0,
    serchkey:'',
    navList: [],//顶部导航
    swiperList:[ ],//轮播
    syList: [],//商铺列表
    baseUrl:''
  },
  
  searchFun(e){//搜索
    var _this=this
    var keyName=e.detail.value
    
    if(!keyName){
      wx.showToast({
        title: '请输入关键字',
        icon:'none'
      })
    }else{
      _this.setData({
        syList:[],
        pageNum:1,
        serchkey:keyName
      
      })
      wx.showLoading({
        title: '加载中',
      })
      this.syList()
    }
  },
  navList(){//顶部导航
    var _this=this
    app.api.getConfig().then(function (res) {
      _this.setData({
        navList:res.data.categories,
        swiperList:res.data.icons
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
  seclctNav:function(e){//导航
    var _this=this
    var id = e.currentTarget.dataset.name
    this.setData({
      nomore:false
    })
    if(id!=-1){
      _this.setData({
        currentIndex: e.currentTarget.dataset.index,
        catId:e.currentTarget.dataset.name,
        syList:[],
        serchkey:'',
        pageNum:1
      })
      wx.showLoading({
        title: '加载中',
      })
      this.syList()
    }else{
      var lat=this.data.lat,lng=this.data.lng
      wx.navigateTo({
        url: '../map/map',
      })
    }
  },
  
  onLoad(){
  
  },
  allFun(){
    this.getseting(()=>{
      this._baseurl()
      this.navList();
      this.syList();
      this.getserve();
    })
  },
  onShow(){
    
    if (!this.data.baseUrl) {
      app.init().then(() => {
        this.allFun()
      })
    }
  },
  _baseurl:function(){//获取图片前缀
    var _this=this
    _this.setData({
      baseUrl:app.globalData.baseUrl
    })
  },
  

  syList:function(datas){//商铺列表
    var _this=this
    if(datas){
      var data=datas
    }else{
      var data={
        lat:this.data.lat,
        lng:this.data.lng,
        page:this.data.pageNum,
        categories:this.data.catId,
        limit:10
      }
      if(this.data.serchkey){
        data['search']=this.data.serchkey;
        data['categories']=''
      }
    }
    app.api.getShopsList({data}).then(function (res) {//商铺列表
      wx.hideLoading()
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
      var syList=this.data.syList,newlist=res.data
      var concatList=syList.concat(newlist)
      _this.setData({
        syList:concatList
      })
    }.bind(this)).catch(function (err) {
      
    }.bind(this))

  },
  detail:function(e){
    var _this=this
    
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../product/product?productid=' + id,
    })
  },
  getserve:function(){//客服
    var _this=this
    app.api.getService().then(function (res) {
      _this.setData({
        qrcode:this.data.baseUrl+res.data.services_img,
        kefuHeadimg:this.data.baseUrl+res.data.avatar,
      })
      this.setData({//loading隐藏
        showLoading:false
      })
    }.bind(this)).catch(function (err) {
      if(err.data.status_code==401){
        app.init().then(() => {
         this.onShow()
        })
      }
    }.bind(this))
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
  onReachBottom: function () {
    var _this=this
    if(this.data.nomore!=true){
      _this.setData({
        moreloading:true,
        more:false,
        page:this.data.pageNum++
      })
      this.syList()
    }else{
      _this.setData({
        moreloading:false
       
      })
    }
    
  },
  catchtouchmove() { },
})
