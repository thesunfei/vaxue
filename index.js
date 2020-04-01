import ajax from "./ajax";
const methods = ["get", "post", "put", "delete", "options", "patch", "head", "copy", "view"];
var vaxue = {
    ajax,
    request(arg = {}, config = this.config || {}) {
        return new (this.Request.bind(this, arg, config || this.config));
    },
    Request: function (arg = {}, config = this.config || {}) {
        this.status = "ready";
        this.uploadProgress = 0;
        switch (typeof arg) {
            case "string":
                this.arg = {
                    url: arg
                };
                break;
            case "function":
                this.arg = arg();
                break;
            case "object":
                this.arg = arg;
        }
        switch (typeof config) {
            case "function":
                this.config = config();
                break;
            case "object":
                this.config = config;
        }
        this.res = this.response = this.arg.hasOwnProperty("default") ? this.arg.default : this.config.default;
        let tempArg = typeof arg == "function" ? arg() : arg;
        for (let attr in tempArg.attrs) {
            this[attr] = tempArg.attrs[attr]
        }
        this.mergeData = () => {
            this.options = {
                ...this.config,
                ...this.arg,
            };
            this.options.params = {
                ...this.config.params,
                ...this.arg.params
            }
            if (this.arg.body.constructor == FormData) {
                this.options.body = this.arg.body
            } else {
                this.options.body = {
                    ...this.config.body,
                    ...this.arg.body
                }
            }
            this.options.headers = {
                ...this.config.headers,
                ...this.arg.headers
            }
            this.options.xhr = this.options.xhr || (() => {
                let xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", (e) => {
                    this.uploadProgress = e.loaded / e.total;
                });
                return xhr;
            });
            this.options.requestObject = this;
        }
        this.mergeData(); //merge arg data and config data into options
        this.extra = undefined;
        this.send = (extra) => {
            typeof config == "function" && (this.config = config());
            typeof arg == "function" && (this.arg = arg(extra));
            this.arg.success = this.arg.success || this.arg.s;
            this.config.success = this.config.success || this.config.s;
            this.arg.fail = this.arg.fail || this.arg.f;
            this.config.fail = this.config.fail || this.config.f || this.config.e;
            if (this.arg.hasOwnProperty("success") && this.arg.success === undefined) {
                delete this.arg.success;
            }
            if (this.arg.hasOwnProperty("fail") && this.arg.fail === undefined) {
                delete this.arg.fail;
            }
            if (this.config.hasOwnProperty("success") && this.config.success === undefined) {
                delete this.config.success;
            }
            if (this.config.hasOwnProperty("fail") && this.config.fail === undefined) {
                delete this.config.fail;
            }
            this.mergeData();
            this.status = "working";
            return ajax(this.options, config).then(res => {
                this.status = "success";
                this.res = this.response = this.options.success ? this.options.success(res) : res;
                return res;
            }).catch(e => {
                this.status = "fail";
                this.res = this.response = this.options.fail ? this.options.fail(e) : e;
            }).finally(() => {
                if (this.options.autoResume) {
                    setTimeout(() => {
                        this.status = "ready"
                    }, this.options.autoResume)
                }
            })
        }
        this.retry = () => {
            this.send()
        };
        !this.options.manual && this.send();
    },
    instance(config = {}, name = null) {
        var instance = {
            config,
            ajax: this.ajax,
            request: this.request,
            Request: this.Request
        };
        methods.forEach(method => {
            instance[method] = this[method]
        })
        if (name) {
            this.instances[name] = instance;
        } else {
            this.instances[Object.keys(this.instances).length] = instance;
        }
        return instance;
    },
    instances: {},
    install(Vue, config = () => ({})) {
        Vue.prototype.vaxue = vaxue;
    }
}
methods.forEach(method => {
    vaxue[method] = function (arg, config) {
        var option;
        switch (typeof arg) {
            case "string":
                option = {
                    url: arg,
                    method
                };
                break;
            case "object":
                option = {
                    ...arg,
                    method
                };
                break;
            case "function":
                option = () => ({
                    ...arg(),
                    method
                })
        }
        return this.ajax(option);
    }
});
export default vaxue