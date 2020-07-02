function params(obj, add) {
    var ret = "";
    for (let i in obj) {
        if (obj[i] !== undefined) {
            ret += i + "=" + obj[i] + "&"
        }
    }
    return (add ? "&" : "?") + ret.slice(0, -1);
}

function verifyData(restriction, obj) {
    var passed = true;
    for (var path in restriction) {
        let tmp = JSON.parse(JSON.stringify(obj));
        for (var node of path.split(".")) {
            if (tmp[node] === undefined) {
                break;
            }
            tmp = tmp[node];
        }
        if (tmp !== restriction[path]) {
            passed = false;
            break;
        }
    }
    return passed;
}
export default function (arg = {}, config = this.config || {}) { //main ajax request
    switch (typeof arg) {
        case "string":
            arg = {
                url: "arg"
            };
            break;
        case "function":
            arg = arg();
    }
    typeof config == "function" && (config = config());
    var options = {};
    options.method = (arg.method || config.method || "get").toUpperCase();
    options.params = {
        ...config.params,
        ...arg.params
    };
    if (JSON.stringify(options.params) == "{}") {
        options.params = undefined;
    }
    options.body = arg.body || config.body;
    options.sendAsJSON = arg.hasOwnProperty("sendAsJSON") ? arg.sendAsJSON : (config.hasOwnProperty("sendAsJSON") ? config.sendAsJSON : (options.body && options.body.constructor == FormData ? false : true));
    options.url = (arg.baseURL || config.baseURL || "") + (arg.url || config.url);
    options.url = options.url + (options.params ? params(options.params, (options.url || "").includes("?")) : "");
    options.strictJSON = arg.hasOwnProperty("strictJSON") ? arg.strictJSON : config.strictJSON;
    options.responseType = options.strictJSON ? "json" : (arg.responseType || config.responseType || "text");
    options.headers = {
        ...config.headers,
        ...arg.headers
    };
    options.timeout = arg.timeout || config.timeout;
    options.successCodes = arg.successCodes || config.successCodes || [200, 304];
    options.requestObject = arg.requestObject || config.requestObject;
    options.xhr = arg.xhr ? arg.xhr(options.requestObject) : (config.xhr ? config.xhr(options.requestObject) : new XMLHttpRequest());
    //XHR request
    var xhr = options.xhr;
    if (!arg.xhr && !config.xhr) {
        xhr.timeout = arg.timeout || config.timeout || 0;
    }
    xhr.open(options.method, options.url);
    xhr.responseType = options.responseType;
    for (let i in options.headers) {
        xhr.setRequestHeader(i, typeof options.headers[i] == "function" ? options.headers[i]() : options.headers[i]);
    }
    var promise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            if (xhr.tryCancel) {
                //reserved for future function
            } else if (xhr.readyState == 4) {
                if (options.successCodes.indexOf(xhr.status) != -1) {
                    if (typeof xhr.response == "object" && options.strictJSON) {
                        if (verifyData(options.strictJSON, xhr.response)) {
                            resolve(xhr.response, xhr);
                        } else {
                            reject(xhr);
                        }
                    } else {
                        resolve(xhr.response, xhr)
                    }
                } else {
                    reject(xhr);
                }
            }
        };
        xhr.addEventListener("abort", function () {
            xhr.canceled = promise.canceled = true;
        });
        xhr.send(options.sendAsJSON ? JSON.stringify(options.body) : options.body);
    })
    promise.cancel = function () {
        promise.tryCancel = xhr.tryCancel = true;
        xhr.abort();
    };
    promise.xhr = xhr;
    return promise;
}