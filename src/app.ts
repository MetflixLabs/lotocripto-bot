import express from 'express'
import { Server as socketio } from 'socket.io'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const server = http.createServer(app)
const io = new socketio({ path: '/socketio' }).listen(server)

app.use(cors())
app.use(helmet())
app.use(express.json())

export { io, server }
