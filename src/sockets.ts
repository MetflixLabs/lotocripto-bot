import { Socket } from 'socket.io'
import { io } from './app'

io.on('connection', (socket: Socket) => {
  console.log('conectou', socket)
})
