import axios from 'axios'

const lotocriptoApi = axios.create({
  baseURL: process.env.LOTOCRIPTO_URI,
  timeout: 5000,
  withCredentials: true,
  headers: {
    cookie: `bot_key=${process.env.BOT_KEY || ''}`
  }
})

export { lotocriptoApi }
