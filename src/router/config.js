import asyncComponent from './asyncComponent'

const _import_components = file => asyncComponent(() => import(`components/${file}`))
const _import_views = file => asyncComponent(() => import(`modules/${file}`))

import Home from '../modules/index';

//含Layout视图
export const loyoutRouterMap = [
  {
    path: '/',
    name: '首页',
    exact: true,
    component: _import_views('index')
  }
]

// 不含Layout视图
export const notLoyoutRouterMap = [
    {
        path: '/404',
        name: '404',
        component: Home
    }
]

// 所有视图
export const routes = loyoutRouterMap.concat(notLoyoutRouterMap)