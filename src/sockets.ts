import SocketIO from 'socket.io'
import { Socket } from 'socket.io'
import { SocketEnum } from './enums/SocketEnum'
import { ParticipantService } from './services/implementations/ParticipantService'

const participantService = new ParticipantService()

const sockets = (io: SocketIO.Server): void => {
  try {
    io.on(SocketEnum.CONNECT, async (socket: Socket) => {
      console.log('res', res)

      const socketId = socket.id
      console.log('CONNECTED', socketId)

      socket.on(SocketEnum.JOIN_ROUND, async data => {
        const { userId } = data

        console.log('JOIN_ROUND', data)
        // await participantService.add(userId, socketId)
      })

      socket.on(SocketEnum.DISCONNECT, async () => {
        // await participantService.deleteBySocketId(socketId)
      })
    })
  } catch (error) {
    return error.message
  }
}

export { sockets }
