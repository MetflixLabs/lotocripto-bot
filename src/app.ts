import express from 'express'
import { Server as socketio } from 'socket.io'
import http, { Server } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { io as ioClient } from 'socket.io-client'
import { sockets } from './sockets'
import { SocketEnum } from './enums/SocketEnum'
import { AccessService } from './services/implementations/AccessService'

const accessService = new AccessService()

export const server = async (): Promise<http.Server> => {
  try {
    const app = express()
    const server = http.createServer(app)
    const path = process.env.SOCKETIO_PATH
    const io = new socketio({ path }).listen(server)

    // Bot login
    const BOT_USER = process.env.BOT_USER
    const BOT_PASSWORD = process.env.BOT_PASSWORD

    if (!BOT_USER || !BOT_PASSWORD)
      throw new Error('Login do bot não declarados nas variáveis de ambiente.')

    await accessService.login(BOT_USER, BOT_PASSWORD)

    // client tests
    const socket = ioClient('http://localhost:4000', { path: '/socketio' })

    socket.emit(SocketEnum.JOIN_ROUND, { userId: 1, socketId: '398721hjas' })

    sockets(io)

    app.use(cors())
    app.use(helmet())
    app.use(express.json())

    return server
  } catch (error) {
    throw new Error(error.message)
  }
}
