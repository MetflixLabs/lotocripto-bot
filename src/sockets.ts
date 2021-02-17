import SocketIO from 'socket.io'
import { Socket } from 'socket.io'
import { SocketEnum } from './enums/SocketEnum'
import { ParticipantService } from './services/implementations/ParticipantService'
import { roundHandler } from './utils/roundHandler'

const participantService = new ParticipantService()

const sockets = async (io: SocketIO.Server): Promise<void> => {
  io.on(SocketEnum.CONNECT, async (socket: Socket) => {
    const socketId = socket.id
    console.log('CONNECT', socketId)

    socket.on(SocketEnum.JOIN_ROUND, async data => {
      const { userId } = data

      console.log('JOIN_ROUND', data)
      const res = await participantService.add(userId, socketId)

      if (res.notification.success) socket.emit(SocketEnum.JOIN_SUCCESS, 'Você entrou na rodada.')
      else if (!res.notification.success)
        socket.emit(SocketEnum.JOIN_FAILED, res.notification.message)
    })

    socket.on(SocketEnum.LEAVE_ROUND, async data => {
      const { userId } = data

      console.log('LEAVE_ROUND', data)
      await participantService.delete(userId, socketId)
    })

    const isDone = await roundHandler()

    if (isDone) {
      const winner = participantService.getWinnerByTime(600_000) // 10min in milisec
      socket.emit(SocketEnum.ROUND_WINNER, winner)
    }
  })
}

export { sockets }
