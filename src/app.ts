import express from 'express'
import { Server as socketio } from 'socket.io'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { io as ioClient } from 'socket.io-client'
import { sockets } from './sockets'
import { SocketEnum } from './enums/SocketEnum'

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

    // client tests
    // const socket = ioClient('http://localhost:4000', { path: '/ws' })

    // socket.emit(SocketEnum.JOIN_ROUND, { userId: 1, socketId: '398721hjas' })

    sockets(io)

    app.use(cors())
    app.use(helmet())
    app.use(express.json())

    return server
  } catch (error) {
    throw new Error(error.message)
  }
}
