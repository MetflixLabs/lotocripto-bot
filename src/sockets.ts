import SocketIO from 'socket.io'
import { Socket } from 'socket.io'
import { SocketEnum } from './enums/SocketEnum'
import { ParticipantService } from './services/implementations/ParticipantService'

const participantService = new ParticipantService()

const sockets = (io: SocketIO.Server): void => {
  io.on(SocketEnum.CONNECT, (socket: Socket) => {
    const socketId = socket.id

    socket.on(SocketEnum.JOIN_ROUND, data => {
      const { userId } = data

      console.log('JOIN_ROUND', data)
      // participantService.add(userId, socketId)
    })
  })
}

export { sockets }
