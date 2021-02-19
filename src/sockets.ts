import interval from 'interval-promise'
import SocketIO from 'socket.io'
import { Socket } from 'socket.io'
import { SocketEnum } from './enums/SocketEnum'
import { emitBalance } from './events/emitBalance'
import { emitWinner } from './events/emitWinner'
import { IBalance } from './interfaces/IBalance'
import { CoinIMPService } from './services/implementations/CoinIMPService'
import { ParticipantService } from './services/implementations/ParticipantService'
import { Observable } from './observables/Observable'
import { IUser } from './interfaces/IUser'

const winnerSubject = Observable<IUser | undefined>()
const balanceSubject = Observable<IBalance>()

winnerSubject.subscribe(emitWinner)
balanceSubject.subscribe(emitBalance)

const participantService = new ParticipantService()
const coinimpService = new CoinIMPService()

const ROUND_TARGET = 1
const ROUND_DURATION = 600_000 // 10min in milisec
const CHECK_BALANCE_INTERVAL = 15000

const sockets = async (io: SocketIO.Server): Promise<void> => {
  // check coinimp balance every 15s
  interval(async () => {
    const balance = await coinimpService.getBalance()
    const { message } = balance
    balanceSubject.notify({
      io,
      props: {
        target: ROUND_TARGET,
        total: parseFloat(message),
      },
    })

    if (parseFloat(balance.message) >= ROUND_TARGET) {
      const winner = await participantService.getWinnerByTime(ROUND_DURATION)
      // if (true) {
      //   const winner = await participantService.getWinnerByTime(0)

      try {
        const walletAddress = winner?.data?.walletAddress
        const totalToPay = ((90 / 100) * ROUND_TARGET).toFixed(8)
        const totalTax = ((10 / 100) * ROUND_TARGET).toFixed(8)

        if (!walletAddress) {
          console.log(`[Nenhum ganhador válido]: nenhum endereço de wallet retornado`)
          io.emit(SocketEnum.ROUND_WINNER, {})

          return
        }

        /**
         * Pay the winner
         */
        const receipt = await coinimpService.payout(walletAddress, totalToPay)

        if (receipt.status === 'error') {
          /**
           * Will grab another winner in 15s
           */
          io.emit(SocketEnum.ROUND_WINNER, {})
          return
        }

        /**
         * Success payout, now grab the administration tax
         */

        if (process.env.MINTME_WALLET) {
          await coinimpService.payout(process.env.MINTME_WALLET, totalTax)
        }

        console.log('[Payment Receipt]: ', receipt)

        winnerSubject.notify({
          io,
          props: winner?.data,
        })
      } catch (error) {
        console.log(`[Nenhum ganhador válido]: ${error}`)
        io.emit(SocketEnum.ROUND_WINNER, {})
      }
    }
  }, CHECK_BALANCE_INTERVAL)

  io.on(SocketEnum.CONNECT, async (socket: Socket) => {
    const socketId = socket.id
    console.log('CONNECT', socketId)

    const balance = await coinimpService.getBalance()

    /**
     * Emit balance on connect
     */
    socket.emit(SocketEnum.TOTAL_BALANCE, {
      total: parseFloat(balance.message),
      target: ROUND_TARGET,
    })

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
  })
}

export { sockets }
