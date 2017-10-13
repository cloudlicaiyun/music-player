<template>
  <transition name="slide">
    <music-list :title="title" :bgImg="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getSongList} from 'api/recommend'
import {ERR_OK} from 'api/config'
export default {
  data () {
    return {
      songs: []
    }
  },
  computed: {
    title () {
      return this.songListDesc.dissname
    },
    bgImage () {
      console.log(this.songListDesc.imgurl)
      return this.songListDesc.imgurl
    },
    ...mapGetters([
      'songListDesc'
    ])
  },
  created () {
    this._getSongList()
  },
  methods: {
    _getSongList () {
      getSongList(this.songListDesc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.cdlist[0].songlist)
        }
      })
    }
  },
  components: {
    MusicList
  }
}
</script>
<style scropted lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
// enter 无的状态
// enter-active  无到有的过程
//  leave 有的状态
  // leave-active 有到无的过程
  .slide-enter-active,.slide-leave-active
    transition:all 0.3s
  .slide-enter,.slide-leave-top
    transform:translate3d(100%,0,0)

</style>
