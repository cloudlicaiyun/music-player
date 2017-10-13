<template>
  <div class="player" v-show="playList.length > 0">
    <transition name="normal">
      <!-- 
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave" -->
      <!-- 播放页面全屏 -->
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <!-- 背景模糊 -->
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <!-- 顶部 -->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!-- 中间cd部分 -->
        <div class="middle"
             @touchstart.prevent="middleTouchStart" 
             @touchmove.prevent="middleTouchMove" 
             @touchend.prevent="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdRotate">
                <img  class="image" :src="currentSong.image"  >
              </div>
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
          </div>
          
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines" :refreshDelay="refreshDelay">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" ref="lyricLine" v-for="(line,index) in currentLyric.lines" :class="{'current': currentLyricNum === index}" :key="line.key">
                  {{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <!-- 底部控制按钮部分 -->
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow==='cd'}"></span>
            <span class="dot" :class="{'active': currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" >
              <i :class="playIcon" @click="togglePlaying" ></i>
            </div>
            <div class="icon i-right">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriateIcon(currentSong)" @click="toggleFavoriate(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 播放页面小屏 底部 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdRotate">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <!-- .stop阻止冒泡到父元素，因为父元素mini-player也有点击事件 -->
          <progress-circle :radius="radius" :percent="percent">
            <i :class="playMiniIcon" class="icon-mini"  @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist" ></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!-- oncanplay 当文件就绪可以开始播放时运行的脚本（缓冲已足够开始时）
         onplay 当没接已就绪可以开始播放时的运行的脚本 -->
    <audio :src="currentSong.url" ref="audio" @play="ready" @erron="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>
<script type="text/ecmascript-6">
import {mapMutations, mapGetters, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import {playerMixin} from 'common/js/mixin'

const transitionDuration = prefixStyle('transitionDuration')
const transform = prefixStyle('transform')
export default {
  mixins: [playerMixin],
  data () {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLyricNum: 0,
      currentShow: 'cd',
      playingLyric: null,
      refreshDelay: 100
    }
  },
  created () {
    this.touch = {}
  },
  // 填充歌曲信息，控制歌曲播放
  computed: {
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    playMiniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdRotate () {
      return this.playing ? 'play' : 'pause'
    },
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'fullScreen',
      'playing',
      'currentIndex'
    ])
  },
  methods: {
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
     // vue transition 动画钩子
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    // vue transition动画钩子结束

    // 获取动画初始位置
    _getPosAndScale () {
      // 左下角图片初始位置
      const targetWidth = 40
      const targetLeft = 40
      const targetBottom = 30
      // 中间大图片距离顶部位置
      const top = 80
      // 中间图片宽度
      const width = window.innderWidth * 0.8
      // 缩放尺度
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - targetLeft)
      const y = window.innerHeight - top - targetBottom - width / 2
      return {
        x,
        y,
        scale
      }
    },
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)

      // 当歌曲暂停时，歌词也暂停，
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    onProgressBarChange (percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying()
      }
      // 点击滚动条时歌词跳到相应位置
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      // 当歌曲单曲循环时，让歌词不会跳动再到歌曲开头
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    // 当前播放列表只有一首歌就设置单曲循环
    next () {
      if (!this.songReady) {
        return
      }
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === this.playList.length) {
          index = 0
        }
        this.setCurrentIndex(index)
      }
      this.songReady = false
      // console.log(this.currentSong)
    },
    prev () {
      if (!this.songReady) {
        return
      }
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
        // console.log(index)
      }
      this.songReady = false
    },
    ready () {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    // 一种是连续点击前进后退出现dom操作，一种是没有网连接的时候
    // 都设置为true，用户依然可以正常使用
    showPlaylist () {
      this.$refs.playlist.show()
    },
    error () {
      this.songReady = true
    },
    format (time) {
      let minute = time / 60 | 0
      let second = time % 60 | 0
      second = second > 9 ? second : '0' + second
      return minute + ':' + second
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    _getLyric () {
      // console.log(this.currentSong)
      this.currentSong.getLyric().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        } else {
          this.currentLyric.stop()
        }
      }).catch(() => {
        this.currentLyric = ''
        this.currentLyricNum = 0
        this.playingLyric = ''
      })
      // console.log(this.currentSong)
    },
    // 获取当前歌曲的序列号和播放歌词
    handleLyric ({lineNum, txt}) {
      this.currentLyricNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd (e) {
      let offsetWidth
      let opacity
      // 从右往左滑
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          this.currentShow = 'lyric'
          opacity = 0
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 从左往右滑
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 当没有歌曲时，直接return
      if (!newSong.id) {
        return
      }
      if (newSong.id === oldSong.id) {
        return
      }
      // 防止歌词切换跳动
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
  //     // 当在微信播放时，或者是浏览器后台切到前台时有个歌曲的准备时间和缓冲时间
  //     // console.log(newSong.getLyric())
  //     // console.log(this.currentLyric)
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.audio.play()
        this._getLyric()
      }, 1000)
      this.setPlayingState(true)
    },
    playing (newPlay) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlay ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>


