<template>
    <div class="recommend" ref="recommend">
      <Scroll ref="scroll" class="recommend-content" :data="discList">
        <div>
           <div v-if="recommends.length" class="slider-wrapper">
             <Slider>
               <div v-for="item in recommends" :key="item.key">
                 <a :href="item.linkUrl">
                   <!-- 因为跟fastclick点击冲突，但是呢，如果加了class：needsclick属性，它就知道你需要点击这个功能 -->
                    <img @load="loadImage" class="needsclick" :src="item.picUrl" alt="">
                 </a>
               </div>
             </Slider>
           </div>
           
           <!-- v-text==innerText v-html===innerHTML -->
           <div class="recommend-list">
             <h1 class="list-title">热门歌单推荐</h1>
             <ul>
               <li v-for="item in discList" @click="selectItem(item)" class="item" :key="item.key">
                 <div class="icon">
                   <img width="60" height="60" v-lazy="item.imgurl" alt="">
                 </div>
                 <div class="text">
                   <h2 class="name" v-html="item.creator.name"></h2>
                   <p class="desc" v-html="item.dissname"></p>
                 </div>
               </li>
             </ul>
           </div>
          </div>
          <div class="loading-container" v-show="!discList.length">
            <loading></loading>
          </div>
      </Scroll>
      <router-view></router-view>
    </div>
</template>
<script type="text/ecmascript-6">
  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {playMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'
  export default {
    mixins: [playMixin],
    data () {
      return {
        recommends: [],
        discList: []
      }
    },
    created () {
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      handlePlayList (playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      selectItem (item) {
        this.$router.push({
          path: `/recommend/${item.dessid}`
        })
        this.setSongListDesc(item)
        console.log(item)
      },
      _getRecommend () {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList () {
        getDiscList().then(res => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      // 因为有时候不知道是轮播图图片还是歌单数据哪个加载渲染出来，但是整个页面都是DOM撑出来的
      // 如果数据先出来，那么图片的高度就没计算进去，下拉列表到不了底部，这时候就需要loadImage方法
      loadImage () {
        if (!this.checkLoaded) {
          this.$refs.scroll.refresh()
          this.checkLoaded = true
        }
      },
      ...mapMutations({
        setSongListDesc: 'SET_SONGLIST_DESC'
      })
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
// display:flex 是一种弹性布局，可以简便、完整、响应式地实现各种页面布局
// align-item : 定义项目在交叉轴上如何对齐
// flex-directon:决定主轴的方向
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>