// components/services/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    qrcode:{
      type:String,
      value:""
    },
    kefuHeadimg:{
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    ishow:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    saveImg(){
      wx.previewImage({
        urls: [this.data.qrcode],
        current:this.data.qrcode
      })
      // wx.saveImageToPhotosAlbum({
      //   filePath: '../image/code.png',
      // })
    },
    catchtouchmove() { },
    dispaly(){
      this.setData({
        ishow: !this.data.ishow
      })
    }
  }
})
