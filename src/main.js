// eslint-disable-next-line
import React from 'react'
import ReactDom from 'react-dom'
import { Provider } from 'react-redux'

import 'nprogress/nprogress.css'
import './styles/index.css'
import './styles/index.less'

import APIClient from './utils/APIClient'
import store from './store/index'
import env from './utils/env'

import Router from './router'
import 'utils/iconfont'
import 'utils/rem'

import initReactFastclick from 'react-fastclick'
initReactFastclick() // 解决IOS onClick不生效

console.log(env.baseUrl)
APIClient.bindURL(env.baseUrl)
APIClient.bindStore(store)
APIClient.bindToken(() => {
  // 一般都是从cookie里获取用户信息
  return {
    params: {
      user_token: ''
    }
  }
})

ReactDom.render(
  <Provider store={store}>
    <div>
      <Router/>
    </div>
  </Provider>
  , document.getElementById('app'))