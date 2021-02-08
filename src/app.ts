import express from 'express'
import { Server as socketio } from 'socket.io'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { io as ioClient } from 'socket.io-client'
import { sockets } from './sockets'
import { SocketEnum } from './enums/SocketEnum'

const app = express()
const server = http.createServer(app)
const io = new socketio({ path: '/socketio' }).listen(server)

// client tests
const socket = ioClient('http://localhost:4000', { path: '/socketio' })

socket.emit(SocketEnum.JOIN_ROUND, { userId: 1, socketId: '398721hjas' })

sockets(io)

app.use(cors())
app.use(helmet())
app.use(express.json())

export { server }
