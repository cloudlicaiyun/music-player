<template>
  <transition name="slide">
    <div class="singer-detail">
      <music-list :title="title" :bgImg="bgImg" :songs="songs"></music-list>
    </div>
  </transition>
</template>
<script type="text/ecmascript-6">
import {mapGetters} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  data () {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters([
      'singer'
    ]),
    title () {
      return this.singer.name
    },
    bgImg () {
      return this.singer.avatar
    }
  },
  created () {
    console.log(this.singer)
    this._getSingerDetail()
  },
  components: {
    MusicList
  },
  methods: {
    _getSingerDetail () {
      if (!this.singer.id) {
        this.$router.push({path: '/singer'})
        return
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          // console.log(res.data)
          // console.log(res.data.list)
          this.songs = this._normalizeSong(res.data.list)
          console.log(this.songs)
        }
      })
    },
    _normalizeSong (list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
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


