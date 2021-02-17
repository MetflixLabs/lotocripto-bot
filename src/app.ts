import express from 'express'
import { Server as socketio } from 'socket.io'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { sockets } from './sockets'

export const server = async (): Promise<http.Server> => {
  try {
    const app = express()
    const server = http.createServer(app)
    const path = process.env.SOCKETIO_PATH
    const io = new socketio({
      path,
      cors: {
        origin: ['https://lotocripto.com.br'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      allowEIO3: true
    }).listen(server)

    sockets(io)

    app.use(cors())
    app.use(helmet())
    app.use(express.json())

    return server
  } catch (error) {
    throw new Error(error.message)
  }
}
