function params(obj, add) {
    var ret = "";
    for (let i in obj) {
        if (obj[i] !== undefined) {
            ret += i + "=" + obj[i] + "&"
        }
    }
    return (add ? "&" : "?") + ret.slice(0, -1);
}

function trim(arr) {
    for (let i in arr) {
        if (typeof arr[i] == "string") {
            arr[i] = arr[i].trim();
        }
    }
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
    try {
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
        options.trim = arg.hasOwnProperty("trim") ? arg.trim : config.trim;
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
        options.xhr = arg.xhr ? (typeof arg.xhr == "function" ? arg.xhr(options.requestObject) : arg.xhr) : (config.xhr ? (typeof config.xhr == "function" ? config.xhr(options.requestObject) : config.xhr) : new XMLHttpRequest());
        if (options.trim) {
            trim(options.headers);
            trim(options.params);
            trim(options.body);
        }
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
        var tryCancel = false;
        var promise = new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                if (tryCancel) {
                    //reserved for future function
                } else if (xhr.readyState == 4) {
                    var response = xhr.response;
                    if (options.responseType == "json" && typeof response == "string") { //fixing for IE
                        try {
                            response = JSON.parse(response)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    if (options.successCodes.indexOf(xhr.status) != -1) {
                        if (typeof response == "object" && options.strictJSON) {
                            if (verifyData(options.strictJSON, response)) {
                                resolve(response, xhr);
                            } else {
                                reject(xhr);
                            }
                        } else {
                            resolve(response, xhr)
                        }
                    } else {
                        reject(xhr);
                    }
                }
            };
            try {
                xhr.send(options.sendAsJSON ? JSON.stringify(options.body) : ((options.headers["Content-Type"] || "").includes("application/x-www-form-urlencoded") ? params(options.body, true).slice(1, Infinity) : options.body));
            } catch (e) {
                console.error(e)
            }
        })
        promise.canceled = false;
        promise.cancel = function (passive = false) {
            promise.tryCancel = true;
            tryCancel = true;
            xhr.abort();
            return new Promise((resolve, reject) => {
                if (xhr.readyState == 0) {
                    let errorMsg = "Cancellation failed,the XMLHttpRequest client open() method hasn't been called yet.";
                    resolve([false, errorMsg]);
                } else if (xhr.readyState == 4) {
                    let errorMsg = "Cancellation failed,the XMLHttpRequest client fetch operation was complete already.";
                    resolve([false, errorMsg]);
                } else {
                    xhr.addEventListener("abort", function () {
                        promise.canceled = true;
                        resolve([true, "Cancellation finished."])
                    });
                }
            })
        };
        promise.xhr = xhr;
        return promise;
    } catch (e) {
        console.error(e)
    }
}