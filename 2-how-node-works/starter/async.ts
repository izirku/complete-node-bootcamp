import fs = require('fs')
import path = require('path')
import axios, { AxiosResponse } from 'axios' // if using require("axios"), we have axios.default :/

const readFilePro = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })

const writeFilePro = (file: string, data: string) =>
  new Promise((resolve, reject) => {
    fs.writeFile(file, data, 'utf-8', err => {
      if (err) reject(err)
      resolve(undefined)
    })
  })

interface DogPicResp {
  message: string
  status: string
}

const getDogPic = async () => {
  try {
    const data = await readFilePro(path.relative(__dirname, 'dog.txt'))

    // replace spaces with "/" per API:
    const dogSlug = data.replace(/ /g, '/')
    console.log('[dogSlug]', dogSlug)

    // fetch 3 dog pics concurrently:
    const res1: Promise<AxiosResponse<DogPicResp>> = axios.get(
      `https://dog.ceo/api/breed/${dogSlug}/images/random`
    )
    const res2: Promise<AxiosResponse<DogPicResp>> = axios.get(
      `https://dog.ceo/api/breed/${dogSlug}/images/random`
    )
    const res3: Promise<AxiosResponse<DogPicResp>> = axios.get(
      `https://dog.ceo/api/breed/${dogSlug}/images/random`
    )

    // wait for all promisses to resolve:
    const all = await Promise.all([res1, res2, res3])

    const images = all.map(el => el.data.message)
    console.log(`[fetched image urls]\n${images.join('\n')}`)

    await writeFilePro(
      path.resolve(__dirname, 'dog-img.txt'),
      images.join('\n')
    )
    console.log('[succes] writing 🐶 images to file')
  } catch (err) {
    throw err
  }
  return '2: ready' // return promise
}
;(async () => {
  try {
    console.log('1: Will get dog pics!')
    const x = await getDogPic()
    console.log(x)
    console.log('3: Done getting dog pics!')
  } catch (err) {
    console.log('ERROR 💥')
  }
})()
