import axios from 'axios'

const coinimpApi = axios.create({
  baseURL: process.env.COINIMP_URI,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'X-API-ID': process.env.X_API_ID,
    'X-API-KEY': process.env.X_API_KEY
  },
  params: {
    'site-key': process.env.SITE_KEY
  }
})

export { coinimpApi }
