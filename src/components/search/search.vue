<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
      <!-- searchBox query变化时派发query事件 search
      component监听该事件获取query值 -->
      <!-- search comonent将该值传给suggest component -->
      <!-- suggest component监听到query值的变化调用search函数 -->
    </div>
    <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!query">
      <scroll class="shortcut" ref="shortcut" :data="shortCut" :refreshDelay="refreshDelay">
        <div class="hot-key">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li @click="addQuery(item.k)" class="item" v-for="item in hotKey" :key="item.key">
              <span>{{item.k}}</span>
            </li>
          </ul>
        </div>
        <!-- 搜索历史部分 -->
        <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
          <!-- 搜索历史列表 -->
          <search-list  :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <!-- 搜索结果component -->
      <suggest ref="suggest" :query="query" @listScroll="blurInput" @select="saveHistory"></suggest>
    </div>
    <router-view></router-view>
    <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
  </div>
</template>
<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box'
import {getHotKey} from 'api/search'
import {ERR_OK} from 'api/config'
import Suggest from 'components/suggest/suggest'
import {mapActions} from 'vuex'
import SearchList from 'base/search-list/search-list'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import {searchMixin} from 'common/js/mixin'

export default {
  mixins: [searchMixin],
  created () {
    this._getHotKey()
  },
  data () {
    return {
      hotKey: [],
      refreshDelay: 100
    }
  },
  computed: {
    shortCut () {
      return this.hotKey.concat(this.searchHistory)
    }
  },
  methods: {
    handlePlayList (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.shortcutWrapper.style.bottom = bottom
      setTimeout(() => {
        this.$refs.shortcut.refresh()
      }, 20)

      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    _getHotKey () {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 15)
        }
      })
    },
    showConfirm () {
      this.$refs.confirm.show()
      // console.log(this.hotKey.concat(this.searchHistory))
    },
    clearSearchHistory () {
      this.clearSearchHistory()
    },
    deleteSearchHistory (item) {
      this.deleteSearchHistory(item)
    },
    ...mapActions([
      'clearSearchHistory'
    ])
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Scroll,
    Confirm
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>