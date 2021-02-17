import interval from 'interval-promise'
import SocketIO from 'socket.io'
import { Socket } from 'socket.io'
import { coinimpApi } from './apis/coinimpApi'
import { SocketEnum } from './enums/SocketEnum'
import { CoinIMPService } from './services/implementations/CoinIMPService'
import { ParticipantService } from './services/implementations/ParticipantService'
import { roundHandler } from './utils/roundHandler'

const participantService = new ParticipantService()
const coinimpService = new CoinIMPService()

const ROUND_TARGET = 10

const sockets = async (io: SocketIO.Server): Promise<void> => {
  io.on(SocketEnum.CONNECT, async (socket: Socket) => {
    const socketId = socket.id
    const balance = await coinimpService.getBalance()

    /**
     * Emit balance on connect
     */
    socket.emit(SocketEnum.TOTAL_BALANCE, {
      total: parseFloat(balance.message.reward),
      target: ROUND_TARGET
    })

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

    interval(async () => {
      const balance = await coinimpService.getBalance()

      socket.emit(SocketEnum.TOTAL_BALANCE, {
        total: parseFloat(balance.message.reward),
        target: ROUND_TARGET
      })
    }, 15000)

    const isDone = await roundHandler(ROUND_TARGET)

    if (isDone) {
      const winner = participantService.getWinnerByTime(600_000) // 10min in milisec
      socket.emit(SocketEnum.ROUND_WINNER, winner)
    }
  })
}

export { sockets }
