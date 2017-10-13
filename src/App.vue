<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!-- 为什么要用keep-alive呢？因为每次页面切换时，再回到刚刚的页面又要重新加载数据，
    组件等又要重新渲染，这样的话体验效果很不好，客户想回到刚的页面又要等待等，
    keep-alive就是把数据等存到内存中
      不会再发送请求 slider不会有闪的现象 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
  import MHeader from './components/m-header/m-header'
  import Tab from './components/tab/tab'
  import Player from 'components/player/player'
  export default {
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
