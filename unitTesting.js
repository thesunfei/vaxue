import vaxue from "./index"
export default {
    basic: {
        get() { //get method
            vaxue.get("http://192.168.1.58:9090/message/list").then(res => {
                console.log(res)
            }).catch(e => {
                console.error(e)
            })
        },
        post() { //post method
            vaxue.post("http://192.168.1.58:9090/message/list").then(res => {
                console.log(res)
            }).catch(e => {
                console.error(e)
            })
        },
        headers() { //test headers
            vaxue.get({
                url: "http://192.168.1.58:9090/message/list",
                headers: {
                    "Content-type": "application/json"
                }
            })
        },
        params() { //test params
            vaxue.get({
                url: "http://192.168.1.58:9090/message/list",
                params: {
                    pageSize: 100,
                    currentPage: 2
                }
            })
        },
        body() { //test body
            vaxue.post({
                url: "http://192.168.1.58:9090/message/list",
                body: {
                    test: 123
                }
            })
        },
        responseType() {
            vaxue.get({
                url: "http://192.168.1.58:9090/message/list",
                responseType: "json"
            }).then(res => {
                console.log("success", typeof res)
            }).catch(e => {
                console.log("failed", e);
            })
        },
        successCodes() {
            vaxue.get({
                url: "http://192.168.1.58:9090/message/list",
                successCodes: [500]
            }).then(res => {
                console.log("success", res)
            }).catch(e => {
                console.log("failed", e);
            })
        },
        strictJSON() {
            vaxue.get({
                url: "http://192.168.1.58:9090/message/list",
                strictJSON: {
                    code: 1,
                    data: null
                }
            }).then(res => {
                console.log("success")
            }).catch(e => {
                console.log("failed");
            })
        },
        xhr() {
            vaxue.get({
                url: "http://192.168.1.58:9090/message/list",
                xhr() {
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        console.log("loaded");
                    }
                    return xhr
                }
            }).then(res => {
                console.log("success")
            }).catch(e => {
                console.log("failed");
            })
        },
        requestObj() { //create an object-type argument based request object
            return vaxue.request({
                url: "http://192.168.1.58:9090/message/list",
                headers: {
                    Authorization: localStorage.Authorization //will this update automatically?
                }
            })
        },
        requestFn() { //create an function-type argument based request object
            return vaxue.request(() => ({
                url: "http://192.168.1.58:9090/message/list",
                headers: {
                    Authorization: localStorage.Authorization //will this update automatically?
                }
            }))
        }
    },
    instance: {
        instObj: vaxue.instance({ //with object-type argument
            baseURL: "http://192.168.1.58:9090",
            headers: {
                Authorization: localStorage.Authorization //will this update automatically?
            }
        },"instObj"),
        instFn: vaxue.instance(() => ({ //with function-type argument
            baseURL: "http://192.168.1.58:9090",
            headers: {
                Authorization: localStorage.Authorization //will this update automatically?
            }
        }),"instFn"),
        get() {
            this.instFn.get("/message/list").then(res => {
                console.log("success")
            }).catch(e => {
                console.error(e)
            })
        }
    }
}