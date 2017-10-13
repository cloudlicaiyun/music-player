import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavoriate} from 'common/js/cache'
const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playList: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  songListDesc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriateList: loadFavoriate()
}
export default state
