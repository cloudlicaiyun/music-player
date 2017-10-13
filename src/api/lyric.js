import axios from 'axios'
import {commonParams} from './config'
export function getLyric (mid) {
  const url = '/api/lyric'

  const data = Object.assign({}, commonParams, {
    g_tk: 67232076,
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    pcachetime: +new Date(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
