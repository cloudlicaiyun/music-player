import {mapMutations, mapGetters, mapActions} from 'vuex'
import { playMode } from 'common/js/config'
import {shuffle} from 'common/js/util'

export const playMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted () {
    this.handlePlayList(this.playList)
  },
  activated () {
    this.handlePlayList(this.playList)
  },
  watch: {
    playList (newVal) {
      this.handlePlayList(newVal)
    }
  },
  methods: {
    handlePlayList () {
      throw new Error('Component must implement handlePlayList method')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playList',
      'mode',
      'favoriateList'
    ])
  },
  methods: {
    changeMode () {
      const mode = (this.mode + 1) % 3
      this.setMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    resetCurrentIndex (list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getFavoriateIcon (song) {
      if (this.isFavoriate(song)) {
        return 'icon-favorite'
      } else {
        return 'icon-not-favorite'
      }
    },
    toggleFavoriate (song) {
      if (this.isFavoriate(song)) {
        this.deleteFavoriateList(song)
      } else {
        this.saveFavoriateList(song)
      }
    },
    isFavoriate (song) {
      let index = this.favoriateList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setMode: 'SET_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriateList',
      'deleteFavoriateList'
    ])
  }
}

export const searchMixin = {
  data () {
    return {
      query: ''
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
     // 当滚动热门搜索时，手机上的app的键盘要设置消失，那就是要Input失去焦点
    blurInput () {
      this.$refs.searchBox.blur()
    },
    saveHistory () {
      this.saveSearchHistory(this.query)
    },
    addQuery (query) {
      this.$refs.searchBox.setQuery(query)
    },
    onQueryChange (query) {
      this.query = query
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
