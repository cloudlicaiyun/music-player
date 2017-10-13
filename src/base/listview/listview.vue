<template>
  <scroll class="list-view" :data="data" ref="listView" :listenScroll= "listenScroll" :probeType="probeType" @scroll="scroll" >
    <ul>
      <li v-for="group in data" class="list-group" :key="group.key" ref="listGroup" >
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item" :key="item.key">
            <img v-lazy="item.avatar" class="avatar" alt="">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    
    <!-- 右侧快速定位列表 -->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove" >
      <ul>
        <li v-for="(item, index) in shortcutList" class="item"
            :data-index="index"
            :key="item.key"
            :class="{'current': currentIndex===index}" >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>

    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
// 需要实时地记录滚动的位置，算到滚动的位置是落到哪个区间，再去计算右边索引的位置
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  // 并不需要像props,data一样需要观测，只需计算
  // probeType：1  滚动不繁忙的时候触发  probeType：2  滚动时每隔一定时间触发 probeType：3  每滚动一像素触发一次
  created () {
    this.touch = {}
    this.listenScroll = true
    this.probeType = 3
    this.listHeight = []
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
//   右侧快速定位列表
  computed: {
    shortcutList () {
      return this.data.map((group) => {
        return group.title.substring(0, 1)
      })
    },
    fixedTitle () {
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    // // 告诉外部被点击了
    selectItem (item) {
      this.$emit('select', item)
    },
    refresh () {
      this.$refs.listView.refresh()
    },
    onShortcutTouchStart (e) {
      e = window.event || e
      // 获得当前触摸的index
      let anchorIndex = getData(e.target, 'index')
      // console.log(anchorIndex)
      let firstTouch = e.touches[0] // 获得手指的位置
    //   console.log(firstTouch)
      this.touch.y1 = firstTouch.pageY // 获得值
    //   console.log(this.touch.y1)
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    //   console.log(this.$refs.listview)
    //   console.log(this.$refs.listGroup)
      // alert('点击了')
    },
    onShortcutTouchMove (e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // | 0 ====math.floor() 向下取整
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
    //   console.log(anchorIndex)
      this._scrollTo(anchorIndex)
    },
     // 监听scroll组件派发的scroll事件 获取滚动时的pos值
    scroll (pos) {
      this.scrollY = pos.y
      // console.log(this.scrollY)
    },
    _scrollTo (index) {
      // 考虑到我们点击右边索引的时候的情况
      if (!index && index !== 0) {
        return
      }
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      // 获取滚动的上限值，这样点击时的index===currentIndex
      this.scrollY = -this.listHeight[index]
      this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
    },

    // 计算每一个singer list的height
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    // 延时，等所有的DOM都渲染好
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听scrollY获取currentIndex
    scrollY (newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部 newY>0
      if (newY > 0) {
        this.currentIndex = 0
      }
      // 在middle部分滚动 因为上限和下限的原因，列表listHeight的元素会多一个
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if ((-newY >= height1 && -newY < height2)) {
          this.currentIndex = i
          this.diff = height2 + newY
          // console.log(this.currentIndex)
          return
        }
      }
      // 滚动到底部 newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      const fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }

      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus">
  @import "~common/stylus/variable"

  .list-view
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
