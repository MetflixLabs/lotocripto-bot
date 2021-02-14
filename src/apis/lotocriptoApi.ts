import axios from 'axios'

const lotocriptoApi = axios.create({
  baseURL: process.env.LOTOCRIPTO_URI,
  timeout: 5000,
  withCredentials: true
})

export { lotocriptoApi }
