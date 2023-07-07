import { djradioPrograms } from '$api'
import { baseDebug } from '$common'
import { DjradioProgram, Song } from '$define'
import moment from 'moment'
import BaseAdapter from './base.js'

const debug = baseDebug.extend('adapter:djradio')

export interface ProgramSong extends Song {
  // 日期
  programDate: string
  // 第x期
  programOrder: number
}

export default class DjradioAdapter extends BaseAdapter {
  #programs: DjradioProgram[]
  async fetchAllPrograms() {
    if (this.#programs) return
    const allPrograms = await djradioPrograms(this.id)
    this.#programs = allPrograms
  }

  get radio() {
    return this.#programs?.[0]?.radio
  }

  async getTitle() {
    await this.fetchAllPrograms()
    return this.radio?.name
  }

  async getCover() {
    await this.fetchAllPrograms()
    return this.radio?.picUrl
  }

  async getSongs(quality: number): Promise<ProgramSong[]> {
    await this.fetchAllPrograms()
    const allPrograms = this.#programs
    const mainSongs = allPrograms.map((x) => x.mainSong)
    const { all } = await this.filterSongs(mainSongs, quality)
    const songs = this.getSongsFromData(all)
    const programsSongs = songs.map((i, index) => {
      const { createTime } = allPrograms[index]
      const programDate = moment(createTime).format('YYYY-MM-DD')
      const programOrder = allPrograms.length - index
      return {
        ...i,
        programDate,
        programOrder,
      } as ProgramSong
    })
    return programsSongs
  }
}
