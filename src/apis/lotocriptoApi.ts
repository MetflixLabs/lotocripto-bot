import axios from 'axios'

const lotocriptoApi = axios.create({
  baseURL: process.env.LOTOCRIPTO_URL,
  timeout: 5000
})

export { lotocriptoApi }
