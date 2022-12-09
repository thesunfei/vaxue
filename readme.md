# vaxue

Promise based AJAX client for web browsers,especially optimized for Vue.js

## Features

- Make [XMLHttpRequests](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) from the browser
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API
- Intercept request and response
- Transform request and response data
- Pre-verify response JSON data
- Cancel requests
- Make object-based request which can store request status and response data

## Installing

```bash
$ npm install vaxue
```

## Example

### Importing

#### ES6 Modules usage

```js
import vaxue from "vaxue";
```

#### CommonJS usage

```js
const vaxue = require("vaxue").default;
```

### Performing basic ajax request

```js
//The default request method is "get"
vaxue
  .ajax("http://test.test")
  .then((res) => {
    console.log(res);
  })
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {});
//Specify request method with function name,supported methods are "get","post","put","delete","options","patch","head","copy","view"
vaxue
  .post("http://test.test")
  .then((res) => {
    console.log(res);
  })
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {});
```

### Performing multiple concurrent requests

```js
Promise.all([vaxue.get("/"), vaxue.post("/")])
  .then((res) => {
    console.log(res);
  })
  .catch((e) => {
    console.log(e);
  });
```

### Creating an instance

you can create a new instance of vaxue with a custom config.

#### vaxue.instance([config],[name])

```js
var instance = vaxue.instance(
  {
    baseURL: "/",
    headers: {
      Authorization: "Bearer 263597f0-2666-42f7-bbd4-0d31eda111de",
    },
  },
  "newInstance"
);
instance.get("path").then((res) => {
  console.log(res);
});
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
    Authorization: localStorage.Authorization, //It will not update if this instance perform request again
  },
});
instance.get("path");
instance.get({ url: "path", params: { id: 1 } });
instance.get(() => ({ url: "path", params: { id: 1 } }));
```

### Function-type config

Every attributes in returned data will update for every performed request.

```js
const instance = vaxue.instance(() => ({
  baseURL: "/",
  headers: {
    Authorization: localStorage.Authorization, //It will update everytime the instance perform request again
  },
}));
instance.get("path");
instance.get({ url: "path", params: { id: 1 } });
instance.get(() => ({ url: "path", params: { id: 1 } }));
```

### String-type config

String-type config is equal to object-type config with only url attribute;

```js
vaxue.get("/"); //is equal to
vaxue.get({ url: "/" });
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
      code: 123,
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
  // "responseType" indicates the type of data that the server will respond with,available options are:"arraybuffer","blob","document","json","text","head","xhr". The default is "text"
  responseType: "json",
  // "successCodes" defines the success codes of response status,with array of numbers,if the response status was not included by the codes,the request will result in "fail".The default is [200,304],the type of the values in the array must be number
  successCodes: [200,304],
  // "strictJSON" specifies the options that the JSON-type response must match,or it will result in fail. For example the response data is {res:{code:1}},the strictJSON was set to {"res.code":0},it will performed as failed because the res.code doesn't equal 1. The responseType of the config will be set to "json" if this option was provided.
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
  },
  trim: true //whether trim values of headers,params and body,the default is false
}
```

## Cancellation

You can cancel a request using returned promise.

```js
var pro = vaxue.get("/");
pro.cancel(); //pro.canceled===true
```

## Request object

Request object can store request status and response data in one object. Available request status are "ready","working","success" and "fail" by default,
they can be changed by using "readyFlag","workingFlag","successFlag" and "failFlag".
It's highly recommanded to use it with modern JS framewoks with responsive data design.

```js
var instance = vaxue.instance({ baseURL: "/" });
var data = instance.request((extra) => ({
  //this "extra" argument will be assigned value of the first parameter of the data.send function
  url: "path",
  params: {
    id: extra,
  },
  attrs: {
    //fields in attrs will preset attributes for this request object
    total: 0,
    loaded: 0,
  },
  successFlag: "success",
  xhr: (requestObj) => {
    let xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      requestObj.total = e.total;
      requestObj.loaded = e.loaded;
    });
    return xhr;
  },
  manual: true, //set to true will stop the request sendding unless using Request.send method
  default: {
    //value of this option will be given to data.response before ajax request,this is often used to prevent errors in JS frameworks.
    data: {
      id: undefined,
    },
  },
  unique: true, //the previous ajax request will be canceled if it's not done,this is very useful for frequent request to prevent old data to overwrite new data.the default is true.
  autoResume: 3000, // status of the request will always return to "ready" after 3000 millisecond after status changed to other.the default is false
  sBefore: (res) => {
    //this function will be executed before the "success" function
    console.log(res);
  },
  success: (res) => {
    return res.data.users; //the returned value will be given to common.response
  },
  sAfter: (res) => {
    //this function will be executed after the "success" function
    console.log(res);
  },
  fBefore: (e) => {
    //this function will be executed before the "fail" function
  },
  fail: (e) => {
    return "error"; //the returned value will be given to common.response too
  },
  fAfter: (e) => {
    //this function will be executed after the "fail" function
  },
}));
console.log(data.uploadProgress); //request object has a attribute named "uploadProgress" to present upload progress;
Object.defineProperty(data, "response", {
  set(v) {
    console.log(v);
  },
}); //you can use data.response for more usage
Object.defineProperty(data, "status", {
  set(v) {
    console.log(v);
  },
}); //you can use data.status for more usage,such as button status
data.send(100);
data.send(200).then((res) => {
    console.log(res);
  }).catch((e) => {
    console.log(e);
  }); //"send" method returns a promise object,which equals to the promise returned by vaxue.ajax()
data.retry().then((res) => {
    console.log(res);
  }).catch((e) => {
    console.log(e);
  }); //"retry" method will re-execute the previous opration invoked by "send" method,the used parameter is also applied.
data.retry(300); //you can also use the "extra" parameter for this method.
console.log(data.xhr); //you can get the original XMLHttpRequest with the xhr property
```
## Request object Properties

* Request.xhr  
The XMLHttpRequest Object used by this request object;

* Request.config  
The configuration of request object;

* Request.arg  
The argument passed to the Request constructor function;

* Request.options  
The merged data of the above 'config' and 'arg';

* Request.extra  
The argument passed to the Request.send function;

* Request.lastRequest  
The promise made by the last time of request object's 'send' method;

* Request.requests  
The array consists of all the promises made by the request object 'send' method;


## Request object Methods

* Request.send(extra)  
Make ajax request with the request object; Returns a promise that resolves to the data that processed by success() or fail() function;

* Request.retry()  
Execute the last ajax request again with the same parameters; Returns a promise that resolves to the data that processed by success() or fail() function;

* Request.cancelLast()  
Cancel the last request; Returns a promise that resolves to an array consists of cancellation status and message;

* Request.cancelAll()  
Cancel all the requests made by this request object; Returns a promise that resolves to an array that consists of arrays of cancellation status and message;


## Example: Using with Vue.js

```html
<template>
  <main>
    <div>{{instance.status}}</div>
    <div>{{instance.response}}</div>
    <div>{{instance.options}}</div>
    <div>{{basic.status}}</div>
    <div>{{basic.response}}</div>
    <!-- basic.res equals to basic.response -->
    <div>{{basic.res}}</div>
    <div>{{basic.options}}</div>
    <v-button @click="instance.send()" :status="instance.status">Submit</v-button>
    <v-button @click="basic.send(123)" :status="basic.status">Submit</v-button>
    <input type="file" @change="upload.send($event.target.files[0])" />
    <v-button @click="upload.cancelLast()">Cancel Uploading</v-button>
    <div>{{upload.uploadProgress}}</div>
    <div>{{upload.loaded}}</div>
    <div>{{upload.total}}</div>
    <div>{{list.pageSize}}</div>
    <div>{{list.currentPage}}</div>
    <div>{{list.total}}</div>
    <div>{{list.xhr.status}}</div>
    <ul>
      <li v-for="i in list.res">{{i.id}}</li>
    </ul>
    <button @click="list.currentPage++;list.send(10)"></button>
  </main>
</template>
<script>
  import vue from "vue";
  import vaxue from "vaxue";
  var instance = vaxue.instance({ baseURL: "/" });
  vue.prototype.instance = instance;
  vue.prototype.listInstance = vaxue.instance((extra, requestObj) => ({
    //the requestObj argument represents the current request object
    baseURL: "/",
    headers: {
      Authorization: "Bearer " + localStorage.access_token,
    },
    strictJSON: {
      code: 0,
    },
    default: [],
    attrs: {
      total: 0,
      currentPage: 0,
      pageSize: extra,
    },
    params: {
      pageSize: requestObj.pageSize,
      currentPage: requestObj.currentPage,
    },
    s: (res, requestObj) => {
      //s function equals to the success function,the requestObj argument represents the current request object
      requestObj.total = res.total;
      requestObj.currentPage = res.currentPage;
      requestObj.pageSize = res.pageSize;
      return res.data;
    },
    fail: (e, requestObj) => {
      return false;
    },
  }));
  export default {
    data() {
      return {
        type: this.$route.params.type,
        instance: this.instance.request("path"),
        basic: vaxue.request((id) => ({
          url: "/path",
          params: {
            id,
            type: this.type,
          },
        })),
        list: this.listInstance.request((extra, requestObj) => ({
          //the requestObj argument represents the current request object
          url: "",
          sBefore: (res) => {
            console.log(res);
          },
          s: (res) => {
            console.log(extra); //output: 10
            return res.data;
          },
        })),
        upload: this.instance.request((file) => ({
          url: "/upload",
          method: "post",
          attrs: {
            loaded: 0,
            total: 0,
          },
          workingFlag: "uploading",
          xhr: (requestObj) => {
            //the requestObj argument represents the current request object
            let xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (e) => {
              requestObj.total = e.total;
              requestObj.loaded = e.loaded;
              requestObj.uploadProgress = e.loaded / e.total;
            });
            return xhr;
          },
          body: (() => {
            let fd = new FormData();
            fd.append("file", file);
            return fd;
          })(),
          default: [],
          manual: true,
        })),
      };
    },
  };
</script>
```
