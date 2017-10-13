<template>
  <div class="slider" ref="slider">
      <div class="slider-group" ref="sliderGroup">
          <slot>
          </slot>
      </div>
      <div class="dots">
        <span class="dot" v-for= "(item,index) in dots" :class="{active: currentPageIndex === index}"></span>
      </div>
  </div>
</template>
<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import {addClass} from 'common/js/dom'
export default {
  data () {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  created () {
    setTimeout(() => {
      this._setSliderWidth()
      this._initSlider()
      this._initDots()

      if (this.autoplay) {
        this._play()
      }
    }, 20)

    // 窗口改变事件,就是Slider的宽度是设置不变的，当发生窗口改变时，图片滚动发生问题，有时候整个页面两三张图片一起，、
    // 这时候就需要监听窗口，每次发生窗口改变时，会去自动重新计算宽度
    window.addEventListener('resize', () => {
      // slider还没创建的时候什么都不做
      if (!this.slider) {
        return
      }
      // 为什么加true，因为每次设置slider宽度时不能每次都加两倍的宽度，一次就就可以
      // 宽度重新计算
      // refresh 也是BScroll的一个接口，宽度发生变化，重新刷新
      this._setSliderWidth(true)
      this.slider.refresh()
    })
  },
  methods: {
    _setSliderWidth (isResize) {
      this.children = this.$refs.sliderGroup.children

      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')

        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots () {
      this.dots = new Array(this.children.length - 2)
    },
    _initSlider () {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true, // 横向滚动
        scrollY: false,
        momentum: false, // 惯性
        snap: true,
        snapLoop: this.loop,
        snapThreshold: 0.3,
        snapSpeed: 400
      })
    // slider有一个事件就是每次切换到下一张之后都有一个结束end事件
    // getCurrentPage得到当前展示图片的index
    // 循环的时候,pageIndex就是拷贝了一份，所以要减1
      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX
        if (this.loop) {
          pageIndex -= 1
        }
        this.currentPageIndex = pageIndex

        if (this.autoplay) {
          // 如果这里不清除定时器的话，轮播是没问题的，但如果点击图片就会发生很奇怪的效果，图片会在现在的一张的上一张徘徊，并且速度加快，轮播不完整
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play () {
      let pageIndex = this.currentPageIndex + 1
      if (this.loop) {
        // 我们的图片模板是有7个
        pageIndex += 1
      }
      this.timer = setTimeout(() => {
        // 用到bScroll的一个借口 goToPage的一个方法
        // 横向滚动，纵向滚动，时间间隔
        this.slider.goToPage(pageIndex, 0, 400)
      }, this.interval)
    }
  },
  // 再页面切换的时候，组件会自动调用destroyed销毁组件，在销毁实例时我们把实例内的方法和指令都解绑，
  // 对这些定时器进行清理，有利于内存的释放。这是一个很好的习惯
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>


