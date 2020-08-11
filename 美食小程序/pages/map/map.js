//index.js
//获取应用实例
const app = getApp()
import api from '../../utils/api.js'
let Api = new api();
Page({
  data: {
    latitude: 1,
    longitude: 1,
    Height: "",
    markers: [],
    show: false,
    indexs: 0,
    img: "../../assets/image/bj.png",
    shopId:'',
    title: "",
    address: "",
    tapLatitude: "",
    tapLongitude: "",
    baseUrl:''
  },

  onLoad: function () {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        //设置map高度，根据当前设备宽高满屏显示   
        var height = res.windowHeight - res.windowWidth / 750 * 90; //footerpannelheight为底部组件的高度
        _this.setData({
          Height: height
        })
      },

    })
    
  },
  onShow(){
    var _this=this
    if (!app.globalData.token) {
      app.init().then(() => {
        this.onShow()
      })
    }else{
      _this.setData({
        baseUrl:app.globalData.baseUrl
      })
        this.syList();
    }
  },
  onReady(){
    let _this=this;
    wx.getLocation({
      type:'gcj02',
      success: res => {
        _this.setData({
          latitude: res.latitude,
          longitude:res.longitude
        })
      },
      fail: err =>{
      }
    })
  },
  syList: function () { //商铺列表
    var _this = this
    var data = {
      lat: this.data.latitude,
      lng: this.data.longitude,

    }
    var baseUrl = this.data.baseUrl
    app.api.getnearShop({
      data
    }).then(function (res) { //商铺列表
      let markers = [];
      res.data.forEach((item, i) => {
        console.log(item)
        markers.push({
          iconPath: "../../assets/image/bj.png",
          id: item.id,
          latitude: Number(Number(item.lat).toFixed(6)),
          longitude: Number(Number(item.lng).toFixed(6)),
          width: 30,
          height: 40,
          scale: "5",
          zIndex: 10,
          callout: { //标记下表的文本标签
            content: item.title,
            color: "#333",
            textAlign: "center",
            fontSize: 14,
            bgColor: "#fff",
            borderRadius: "50",
            borderColor: "#fd1515",
            borderWidth: "1",
            padding: "8",
            display: "ALWAYS",
          },
          list: {
            "img": baseUrl+item.img,
            "title": item.title,
            "address": item.addr+item.addr_describe
          }
        })
      });
      this.setData({
        markers: markers
      });

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
                  this.onShow()
                })
              }).catch(err => {
                console.log(err)
              })
            
          }
        })
      }
    }.bind(this))
  },


  // close
  close: function () {
    this.setData({
      show: false
    })
  },

  //标点事件 气泡事件
  markertap(e) {
    var id = e.markerId;
    var Inx;
    this.data.markers.forEach(function (item, index, arr) {
      if (arr[index].id == id) {
        //   console.log(index)
        Inx = index;
      }
    });

    this.setData({
      show: true,
      indexs: Inx,
      shopId:this.data.markers[Inx].id,
      img: this.data.markers[Inx].list.img,
      title: this.data.markers[Inx].list.title,
      address: this.data.markers[Inx].list.address,
    })
  },
  //点击地图 下面的弹层消失
  tap(e) {
    this.setData({
      show: false
    })
  },
  //选择位置位置
  openLocation: function (e) {
    console.log(this.data.markers)

    wx.openLocation({
      latitude: this.data.markers[this.data.indexs].latitude,
      longitude: this.data.markers[this.data.indexs].longitude,
      scale: 18,
      name: this.data.markers[this.data.indexs].list.title,
      address: this.data.markers[this.data.indexs].list.address
    })

    this.setData({
      show: false
    })

  },
  productDetail:function(e){
    console.log('45')
    console.log(e)
    var id=e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../store/store?shopId=' + id,
    })
  }

})

