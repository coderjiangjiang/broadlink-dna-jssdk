# broadlink-dna-jssdk

 broadlink dna platform jssdk supported by ts

## Broadlink 平台 H5 JS SDK接口

## 安装

>npm install --save broadlink-dna-jssdk

## JS SDK接口说明

### ready

```javascript
ready();
```

功能说明: 启动函数，当 JSSDK 就绪之后，调用启动函数。

入参项:  无|'device'|'online',默认为'device'（设备控制应用引入），'online'(非设备控制应用引入)。

返回项: Promise，如jssdk初始化成功则resolved，否则rejected。Resolved会传入设备状态.

e.g:

```javascript
import JSSDK from 'broadlink-dna-jssdk';
var ready=JSSDK.ready();
ready.then(function(data){
    //data的数据格式如下:
    {
        'status':{
            'mark':1,
            'temp':25
            },
    //以下两个字段（'online','name'）不一定会存在，开发者需要根据平台的不同进行判断
        'online': '0/1/2/3',//设备状态:未知/本地/远程/离线(京东平台对应:在线/离线)
        'name':'refrigerator'
    }
}).catch(function(error){
    // error为一个Error对象，数据格式如下:
    {
        message:‘网络超时’,//错误描述
        code:11,   //错误码
        msg:平台返回的错误信息
    }
})
```

### setDeviceStatus

```javascript
setDeviceStatus(cmd);
```
  
功能说明: 给设备发送命令

输人项:  

* cmd：命令对象。

```javascript
{
    'mark': 1,
    'temp': 25
}
```

返回项：

一个 Promise 对象,调用者可以这样使用：

```javascript
import JSSDK from 'broadlink-dna-jssdk';
var prms = JSSDK.setDeviceStatus(…);
// 显示等待沙漏
prms.then(function(data) {
//受到平台的限制，不一定会传入data参数，如国美
//data是设备最新状态，数据结构为：
{
'status': {
    'mark': 1,
    'temp': 25
    },
//以下两个字段（'online','name'）不一定会存在，开发者需要根据平台的不同进行判断
'online': '0/1/2/3',//设备状态:未知/本地/远程/离线(京东平台对应:在线/离线)
'name':'refrigerator'
}
}).catch(function(error) {
// error为一个Error对象，数据格式如下：
{
    message:‘网络超时’,//错误描述
    code:11,   //错误码
    msg:平台返回的错误信息
}
});
```

### getDeviceStatus

```javascript
  /*三种形式*/
  getDeviceStatus()  //查询所有状态
  
  getDeviceStatus(array) //查询指定状态，如[‘pwr’,’temp’]
```

功能说明: 尝试更新设备状态

输人项:  

* params：接口名称数组，可选。若不选，则获取所有接口状态。

* array参数数组. 若不选，则获取所有接口状态。

返回项：

一个 Promise 对象,调用者可以这样使用：

```javascript
import JSSDK from 'broadlink-dna-jssdk';
var prms = JSSDK.getDeviceStatus(…);
// 显示等待沙漏
prms.then(function(data) {
    //data是设备最新状态，数据结构为：
    {
        'status': {
            'mark': 1,
            'temp': 25
            },
    "online":"0/1/2/3",//设备状态:未知/本地/远程/离线(京东平台对应:在线/离线)
    'name':'refrigerator'
    }
}).catch(function(error) {
    // error为一个Error对象，数据格式如下：
    {
    message:'网络超时',//错误描述
    code:11,//错误码
    msg:平台返回的错误信息
    }
);
  ```

### platformSDK

```javascript
import JSSDK from 'broadlink-dna-jssdk';
JSSDK.platformSDK;
```
  
功能说明:  获取broadlink dna平台提供的sdk对象
