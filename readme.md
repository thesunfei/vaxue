# vaxue

Promise based HTTP client for the browser

## Features

- Make [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) from the browser
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API
- Intercept request and response
- Transform request and response data
- Pre-verify response JSON data
- Cancel requests
- Make object based request which can store request status and response data

## Installing

```bash
$ npm install vaxue
```

## Example

### Importing

#### ES6 Modules usage
```js
import vaxue from "vaxue"
```

#### CommonJS usage
```js
const vaxue=require("vaxue").default
```

### Performing basic ajax request

```js
//The default request method is "get"
vaxue.ajax("http://test.test").then(res => {
    console.log(res)
}).catch(e => {
    console.log(e)
}).finally(() => {})
//Specify request method with function name,supported methods are "get","post","put","delte","options","patch","head","copy","view"
vaxue.post("http://test.test").then(res => {
    console.log(res)
}).catch(e => {
    console.log(e)
}).finally(() => {})
```

### Performing multiple concurrent requests

```js
Promise.all([vaxue.get("/"), vaxue.post("/")]).then(res => {
    console.log(res)
}).catch(e => {
    console.log(e)
})
```

### Creating an instance

you can create a new instance of vaxue with a custom config.

#### vaxue.create([config],instance name)

```js
var instance = vaxue.instance({
    baseURL: "/",
    headers: {
        Authorization: "Bearer 263597f0-2666-42f7-bbd4-0d31eda111de"
    }
}, newInstance);
instance.get("path").then(res => {
    console.log(res)
})
```

Show all created instances

```js
vaxue.instances();
//output: {newInstance:{config:{...},ajax:f,request:f,Reqeust:f,get:f,...}}
```

## Request Config

There are three types of config options for making requests:object,function and string,only the url is required.

### Object-type config

This is one-time generate config,which means some data such as from localStorage will not update if the request was performed again.

```js
const instance = vaxue.instance({
    baseURL: "/",
    headers: {
        Authorization: localStorage.Authorization //It will not update if this instance perform request again
    }
})
instance.get("path")
instance.get({url:"path",params:{id:1}})
instance.get(()=>({url:"path",params:{id:1}}))
```

### Function-type config

Every attributes in returned data will update for every performed request.

```js
const instance = vaxue.instance(()=>({
    baseURL: "/",
    headers: {
        Authorization: localStorage.Authorization //It will update everytime the instance perform request again
    }
}))
instance.get("path")
instance.get({url:"path",params:{id:1}})
instance.get(()=>({url:"path",params:{id:1}}))
```

### String-type config

String-type config equal to object-type config with only url attribute;

```js
vaxue.get("/")//equal to
vaxue.get({url:"/"})
```

### Config options

```js
{
    // "url" is the server URL that will be used for the request
    url: '/user',
    // "baseURL" will be prepended to "url"
    baseURL:"/",
    // "method" is the request method to be used when making the request,the default is "get"
    method: 'get',
    // "params" are the URL parameters to be sent with the request
    params: {
        code:123,
        user:"admin"
    },
    // "body" is the XMLHttpRequest body to be sent whith the request
    body: {
        date: 1583207193
    },
    // "headers" are custom headers to be sent
    headers: {'Content-type': 'application/json'},
    // "sendAsJSON" will convert request body to JSON string,the default is false
    sendAsJSON: true,
    // "responseType" indicates the type of data that the server will respond with,available options are:"arraybuffer",blob","document","json","text". The default is "text"
    responseType: "json",
    // "successCodes" defines the success codes of response status,if the response status was not included by the codes,the request will result in "fail".The default is [200,304],the type of the values in the array must be number
    successCodes:[200,304],
    // "strictJSON" specifies the options that the JSON-type response must match,or it will result in fail. For example the response data is {res:{code:1}},the strictJSON was set to {"res.code":0},it will performed as failed because the res.code doesn't equal to 1. The responseType of the config will be set to "json" if this option was provided.
    strictJSON:{
        "res.code": 0
    },
    // `timeout` specifies the number of milliseconds before the request times out.
    timeout: 10000,
    // "xhr" specifies the custom XMLHttpRequest object used to make the request,it must be a function that use a XMLHttpRequest object as the return value.
    xhr(){
        var xhr=new XMLHttpRequest();
        xhr.onprogress=function(event){
            console.log(event);
        }
        xhr.onload=function(){
            console.log("loaded")
        }
        return xhr
    }
}
```

## Cancellation

You can cancel a request using returned promise.

```js
var pro=vaxue.get("/");
pro.cancel();
```

## Request object

Request object can store request status and response data in one object. Available request status are "ready","working","success" and "fail".
It's highly recommanded to use it with modern JS framewoks with responsive data design.

```js
var instance=vaxue.instance({baseURL:"/"});
var data=instance.request({
    url:"path",
    params:{
        id:1
    },
    manual:true, //set to true will stop the request sendding unless using Request.send method
    default:{ //value of this option will be given to data.response before ajax request,this is often used to prevent errors in JS frameworks.
        data:[1,2,3]
    },
    success: res=>{
        return res.data.users //the returned value will be given to common.response
    },
    fail: e=>{
        console.error(e)
        return "error" //the returned value will be given to common.response too
    }
})
Object.defineProperty(data,"response",{set(v){console.log(v)}}) //you can use data.response for more usage
Object.defineProperty(data,"status",{set(v){console.log(v)}}) //you can use data.status for more usage,such as button status
data.send();
```

Using with Vue.js

```html
<template>
    <main>
        <div>{{instance.status}}</div>
        <div>{{instance.response}}</div>
        <div>{{instance.options}}</div>
        <div>{{basic.status}}</div>
        <div>{{basic.response}}</div>
        <div>{{basic.options}}</div>
    </main>
</template>
<script>
import vue from "vue"
import vaxue from "vaxue"
var instance=vaxue.instance("/");
vue.prototype.instance=instance;
export default {
    data(){
        return {
            instance:this.instance.request("path"),
            basic:vaxue.request("/path")
        }
    }
}
</script>
```