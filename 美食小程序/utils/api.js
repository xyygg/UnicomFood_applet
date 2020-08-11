/**
 * name: api.js
 * description: 包含所有api
 * author: 
 * date: 
 */
import request from './request.js'

class api {
  constructor() {
    this._baseUrl = 'https://mini.hnchanggeng.com/api/'
    this._defaultHeader = { 'Content-Type': 'application/json' }
    this._request = new request
    this._request.setErrorHandler(this.errorHander)
  }

  /**
   * 统一的异常处理方法
   */
  errorHander(res) {
    var _this=this
    
    // if(res.data && res.data.code!=undefined){
    //   switch (res.data.code){
    //     case 401:
    //       console.log("登陆状态异常")
    //       break;
    //     default:
    //       console.log('41')
    //       $Toast({
    //         content: res.data.error
    //       })
    //       break;
    //   }
    // }
  }

  /**
   * 初始化用户数据
   */
  getToken({ code}){
    return this._request.getRequest(this._baseUrl + 'token', { code }).then(res => res.data)
  }
  getService(){//客服头像
    return this._request.getRequest(this._baseUrl + 'service', { }).then(res => res.data)
  }
 
  getConfig(){//导航加首页轮播图
    return this._request.getRequest(this._baseUrl + 'config', {  }).then(res => res.data)
  }
  getShopsList({data}){//首页商品列表
    return this._request.getRequest(this._baseUrl + 'shops_list', {...data}).then(res => res.data)
  }
  getProduct({data}){//商品详情
    return this._request.getRequest(this._baseUrl + 'act_detail', {...data}).then(res => res.data)
  }
  getShopdetail({data}){//店铺信息
    return this._request.getRequest(this._baseUrl + 'shops', {...data}).then(res => res.data)
  }
  getFormsub({data}){//提交
    return this._request.postRequest(this._baseUrl + 'apply', {...data}).then(res => res.data)
  }
  getActDetail({data}){//店铺详情
    return this._request.getRequest(this._baseUrl + 'shops', {...data}).then(res => res.data)
  }
  getShopsact({data}){//店铺活动列表
    return this._request.getRequest(this._baseUrl + 'shops_act', {...data}).then(res => res.data)
  }
  getnearShop({data}){//店铺活动列表
    return this._request.getRequest(this._baseUrl + 'nearby', {...data}).then(res => res.data)
  }
}
export default api