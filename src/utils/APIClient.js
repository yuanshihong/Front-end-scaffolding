'use strict'
var __assign = (this && this.__assign) || Object.assign || function(t) {

  for (var s, i = 1, n = arguments.length; i < n; i++ ) {
    s = arguments[i]
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
      t[p] = s[p]
  }
  return t
}
var __rest = (this && this.__rest) || function (s, e) {
  var t = {}
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p]
  if (s != null && typeof Object.getOwnPropertySymbols === 'function')
  // eslint-disable-next-line
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
      t[p[i]] = s[p[i]]
  return t
}
Object.defineProperty(exports, '__esModule', { value: true })
var axios_1 = require('axios')
var AJAX_START = 'AJAX_START'
var AJAX_FAIL = 'AJAX_FAIL'
var AJAX_SUCCESS = 'AJAX_SUCCESS'
var AUTH_ERROR = 'AUTH_ERROR'
var AJAX = {
  R: AJAX_START,
  S: AJAX_SUCCESS,
  F: AJAX_FAIL
}
var client
/**
 * API Client
 *
 * @return {APIClient}
 *
 * @example
 * // 基本使用
 * // bindURL -> bindStore -> bindToken -> 开始使用
 * import APIClient from '@private/apiclient'
 * let client = APIClient.singleInstance
 * client.bindURL('https://example.org/api/v1')
 * client.bindStore(ReduxStore)
 * client.bindToken(myTokenGeneratorFunc)
 *
 * client.get(...)
 */
var APIClient = /** @class */ (function () {
  function APIClient() {
    var _this = this
    this.baseUrl = ''
    this.methods = ['get', 'post', 'put', 'delete', 'patch']
    this.middleware = this.middleware.bind(this) // Redux 会改变 this
    this.methods.forEach(function (method) {
      var defaultOptions = {
        params: {},
        data: {},
        headers: {},
        responseType: 'json'
      }

      _this[method] = function (apiPath, options, dispatchFlag) {
        if (options === void 0) { options = defaultOptions }
        if (dispatchFlag === void 0) { dispatchFlag = false }
        var params = options.params, data = options.data, headers = options.headers, responseType = options.responseType, opts = __rest(options, ['params', 'data', 'headers', 'responseType'])
        params = params || {}
        data = data || {}
        headers = headers || {}
        responseType = responseType || 'json'
        dispatchFlag = !!(dispatchFlag || options.dispatchFlag)
        delete opts.dispatchFlag
        var requestInfoWithToken = _this.insertToken(params, data, headers)
        params = requestInfoWithToken.params
        data = requestInfoWithToken.data
        headers = requestInfoWithToken.headers
        dispatchFlag && _this.dispatchStart()
        if (typeof _this.requestParser === 'function') {
          var parsedRequestInfo = _this.requestParser({
            path: apiPath,
            params: params,
            data: data,
            headers: headers
          })(params = parsedRequestInfo.params, data = parsedRequestInfo.data, headers = parsedRequestInfo.headers) // 这是个解构, See: https://goo.gl/e3qGrg
        }
        var axiosOptions = __assign({ method: method,
          params: params,
          data: data,
          headers: headers }, opts, { responseType: responseType, url: _this.spliceURL(apiPath) })
        if (method === 'get')
          delete axiosOptions.data
        return APIClient.cancelablePromise(new Promise(function (resolve, reject) {
          axios_1.default(axiosOptions).then(function (resp) {
            dispatchFlag && _this.dispatchSuccess()
            if (typeof _this.responseParser === 'function') {
              resolve(_this.responseParser(__assign({}, resp, { requestInfo: __assign({}, options, { path: apiPath }) })))
            }
            else {
              resolve(resp.data)
            }
          }, function (error) {
            var status = Number((error && error.response && error.response.status) || 200)
            if (status === 401) {
              _this.sendAction({ type: AUTH_ERROR })
            }
            if (status === 500) {
              _this.dispatchFail('服务器出错了', 500)
            }
            else {
              var msg = (error && error.response && error.response.data && error.response.data.detail) ||
                                (error && error.response && error.response.statusText) ||
                                error.message ||
                                '\u51FA\u9519\u5566 :' + error.statusText
              _this.dispatchFail(msg, status)
            }
            reject(error)
          })
        }))
      }
    })
  }
  Object.defineProperty(APIClient, 'singleInstance', {
    /**
         * 返回单例的 APIClient
         *
         * @return {APIClient}
         */
    get: function () {
      return client || (client = new APIClient())
    },
    enumerable: true,
    configurable: true
  })
  /**
     * Cancelable Promise - 可取消的 Promise Wrap
     *
     * @description Cancelable Promise 不是真正的可取消 Promise，
     * 仅在取消后不再响应原有 Promise 的 Then
     *
     * @param {Promise} promise - 传入的 Promise
     * @return {Promise}
     *
     * @example
     * let action = cancelablePromise(request.get(...))
     *   .then(...)
     *   .catch(...)
     *
     * // 假设 100 毫秒后仍未成功则默认失败，丢弃 100 毫秒后的返回
     * setTimeout(() => action.cancel(), 100)
     *
     */
  APIClient.cancelablePromise = function (promise) {
    var hasCanceled = false
    var wrappedPromise = new Promise(function (resolve, reject) {
      promise.then(function (val) {
        !hasCanceled && resolve(val)
      }).catch(reject)
    })
    wrappedPromise.cancel = function () {
      hasCanceled = true
    }
    return wrappedPromise
  }

  /**
     * Redux Middleware
     *
     * @param {*} dispatch - Redux dispatch 方法
     * @param {*} getState - Redux getState 方法
     * @return {Promise}
     *
     * @see {@link APIClient.bindStore}
     *
     * @example
     * // Action 中自动触发 AJAX_* 事件
     * dispatch({
     *   type: $('MY_ACTION'),
     *   promise: client => client.get('/user_info')
     * })
     */
  APIClient.prototype.middleware = function (_a) {
    var _this = this
    var dispatch = _a.dispatch
    return function (next) {
      return function (action) {
        if (!action)
          return Promise.resolve()
        // onlyFeedbackAction: true 时不发送 request action
        var promise = action.promise, types = action.types, type = action.type, args = action.args, onlyFeedbackAction = action.onlyFeedbackAction, callback = action.callback, rest = __rest(action, ['promise', 'types', 'type', 'args', 'onlyFeedbackAction', 'callback'])
        if (typeof promise !== 'function' || !types) {
          return next(action)
        }
        type && dispatch(__assign({ type: type }, rest, { args: args }))
        var REQUEST = types.REQUEST, SUCCESS = types.SUCCESS, FAILURE = types.FAILURE
        if (!onlyFeedbackAction) {
          dispatch(__assign({ type: REQUEST }, rest, { args: args }))
        }
        return promise(_this)
          .then(function (data) {
            try {
              dispatch(__assign({ type: SUCCESS }, rest, { args: args, data: data }))
              if (callback && typeof callback === 'function') {
                callback.apply(void 0, [data].concat(rest))
              }
            }
            catch (reducerParseError) {
              console.error(reducerParseError)
              throw reducerParseError
            }
            return Promise.resolve(data)
          })
          .catch(function (error) {
            // error信息需要根据实际数据结构构造
            dispatch(__assign({ type: FAILURE, error: error.response }, rest, { args: args }))
            return Promise.reject(error)
          })
      }
    }
  }

  /**
     * 绑定 API 地址
     *
     * @param {string} url - 例: https://example.org/api/v1/
     * @return {APIClient}
     */
  APIClient.prototype.bindURL = function (url) {
    this.baseUrl = url
    return this
  }
  /**
     * 绑定 Redux Store
     *
     * @param {*} store - Redux Store
     * @return {*}
     *
     * @example
     * import {applyMiddleware, createStore} from 'redux'
     * let client = APIClient.singleInstance
     * let store = applyMiddleware(client.middleware)(createStore)
     */
  APIClient.prototype.bindStore = function (store) {
    this.store = store
    return store
  }
  /**
     * 绑定 API Token
     *
     * @param {function} getToken - 一个用于返回认证信息的方法
     * @return {APIClient}
     *
     * @example
     * let client = APIClient.singleInstance
     * client.bindToken(() => {
     *   return {
     *     params: {token: 'sample-token', uid: 1}, // 通过 Query Param 认证, 通用
     *     data: {token: 'sample-token', uid: 1}, // Post 时在Body中加入字段认证, GET 不可用
     *     headers: { // 使用 HTTP Header 认证，通用
     *       Authorization: 'Basic fakeBase64=='
     *     }
     *   }
     * })
     */
  APIClient.prototype.bindToken = function (getToken) {
    this.getToken = getToken
    return this
  }
  /**
     * 触发 Redux Action
     *
     * @param {object} action - Redux Action
     * @return {Promise}
     */
  APIClient.prototype.sendAction = function (action) {
    if (this.store) {
      return this.store.dispatch(action)
    }
  }
  /**
     * @typedef {object} TokenInfo
     * @property {string} token - Auth Token
     * @property {string} paramName - 参数名, 例: ?auth_token=sample-token
     * @property {object} [headers] - 额外的 HTTP Header
     */
  /**
     * 获取 Token
     *
     * @description 此 getToken 需要使用 bindToken 覆盖，否则将会抛出异常，
     * 如果设置了 headers, 将会使用 header 认证，不再添加 URL 参数
     *
     * @return {TokenInfo}
     */
  APIClient.prototype.getToken = function () {
    throw new Error('APIClient 未绑定 Token')
  }
  /**
     * 向已有的请求信息写入 Token
     *
     * @private
     * @param {object} originParams - Query parameters
     * @param {object} originData - Post data
     * @param {object} originHeaders - HTTP headers
     * @return {{headers: {object}, params: {object}, data: {object}}}
     */
  APIClient.prototype.insertToken = function (originParams, originData, originHeaders) {
    var _a = this.getToken(), params = _a.params, data = _a.data, headers = _a.headers
    var notEmpty = function (object) {
      return (typeof object === 'object' && Object.keys(object).length > 0)
    }
    if (notEmpty(headers)) {
      originHeaders = __assign({}, originHeaders, headers)
    }
    else {
      if (notEmpty(data) && notEmpty(originData)) {
        originData = __assign({}, originData, data)
      }
      else if (notEmpty(params)) {
        originParams = __assign({}, originParams, params)
      }
    }
    return { headers: originHeaders, params: originParams, data: originData }
  }

  /**
     * 将 API 路径与 API URL 拼合
     *
     * @private
     * @param {string} path
     * @return {string}
     */
  APIClient.prototype.spliceURL = function (path) {
    if (!path) {
      throw new Error('未设置API地址')
    }
    // 匹配 'https://', 'http://', '//', '/'
    return path.match(/^(https?:)?\/?\//) ? path : (this.baseUrl + path)
  }

  /**
     * 触发 AJAX_START
     *
     * @private
     */
  APIClient.prototype.dispatchStart = function () {
    this.sendAction({ type: AJAX_START })
  }
  /**
     * 触发 AJAX_SUCCESS
     *
     * @private
     */
  APIClient.prototype.dispatchSuccess = function () {
    this.sendAction({ type: AJAX_SUCCESS })
  }
  /**
     * 触发 AJAX_FAIL
     *
     * @private
     * @param {string} message - 错误信息
     * @param {number} code - 错误码
     */
  APIClient.prototype.dispatchFail = function (message, code) {
    this.sendAction({ type: AJAX_FAIL, error: { message: message }, code: code })
  }
  /**
     * @typedef {object} requestInfo
     *
     * @property {string} path
     * @property {object} params
     * @property {object} data
     * @property {object} headers
     */
  /**
     * 绑定请求预处理函数
     *
     * @param {function} parser
     * @return {APIClient}
     *
     * @example
     *
     * /**
     * * 请求预处理函数
     * * @param {requestInfo} requestInfo
     * * @return {requestInfo}
     * *\/
     * function requestParser (requestInfo) {
     *   delete requestInfo.params.uid
     *   return requestInfo
     * }
    */
  APIClient.prototype.bindRequestParser = function (parser) {
    this.requestParser = parser
    return this
  }
  /**
     * @typedef {object} responseInfo
     *
     * @property {*} data
     * @property {number} status
     * @property {string} statusText
     * @property {object} headers
     * @property {requestInfo} requestInfo
     */
  /**
     * 绑定响应预处理函数
     *
     * @param {function} parser
     * @return {APIClient}
     *
     * @example
     *
     * /**
     * * 响应预处理函数
     * * @param {responseInfo} response
     * * @return {responseInfo}
     * *\/
     * function responseParser (response) {
     *   return response.data
     * }
     */
  APIClient.prototype.bindResponseParser = function (parser) {
    this.responseParser = parser
    return this
  }
  APIClient.AJAX_STATE = AJAX
  return APIClient
}())
exports.default = APIClient.singleInstance
