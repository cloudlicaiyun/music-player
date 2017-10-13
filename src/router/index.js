import Vue from 'vue'
import Router from 'vue-router'

import Rank from 'components/rank/rank'
import Recommend from 'components/recommend/recommend'
import Search from 'components/search/search'
import Singer from 'components/singer/singer'
import Tab from 'components/tab/tab'
import SingerDetail from 'components/singer-detail/singer-detail'
import SongListDesc from 'components/songListDesc/SongListDesc'
import TopList from 'components/top-list/top-list'
import UserCenter from 'components/user-center/user-center'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend' // 默认首页是推荐页面
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: SongListDesc
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/tab',
      component: Tab
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})
