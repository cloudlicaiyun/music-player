<template>
  <transition name="slide">
    <music-list :title="title" :bgImg="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>
<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getMusicList} from 'api/rank'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'

export default {
  computed: {
    title () {
      return this.topList.topTitle
    },
    bgImage () {
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },
    ...mapGetters([
      'topList'
    ])
  },
  created () {
    this._getMusicList()
  },
  data () {
    return {
      songs: [],
      rank: true
    }
  },
  methods: {
    _getMusicList () {
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      getMusicList(this.topList.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.songlist)
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        const musicData = item.data
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
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
