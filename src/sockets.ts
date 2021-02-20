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

let CURRENT_BALANCE = 0
const ROUND_TARGET = 1
const ROUND_DURATION = 600_000 // 10min in milisec
const CHECK_BALANCE_INTERVAL = 30000
let ONLINE_USERS = 0
let MINING_USERS = 0

const sockets = async (io: SocketIO.Server): Promise<void> => {
  /**
   * Initial balance fetch
   */
  try {
    const balance = await coinimpService.getBalance()
    const { message } = balance
    CURRENT_BALANCE = parseFloat(message)

    /**
     * Emit blue notification if balance matches on start
     */
    if (CURRENT_BALANCE >= ROUND_TARGET) {
      console.log(`[Sufficient Balance]: Will pick a winner in the first interval iteration`)
      io.emit(SocketEnum.ROUND_WINNER, {})
    }
  } catch (error) {
    console.log(`Failed to fetch initial balance: ${error}`)
  }

  /**
   * check coinimp balance every 30s
   */
  interval(
    async () => {
      const balance = await coinimpService.getBalance()
      const { message } = balance

      CURRENT_BALANCE = parseFloat(message)

      balanceSubject.notify({
        io,
        props: {
          target: ROUND_TARGET,
          total: CURRENT_BALANCE,
        },
      })

      if (CURRENT_BALANCE >= ROUND_TARGET) {
        const winner = await participantService.getParticipantByTime(ROUND_DURATION)
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

          /**
           * Refetch balance
           */
          const balance = await coinimpService.getBalance()
          const { message } = balance
          CURRENT_BALANCE = parseFloat(message)

          balanceSubject.notify({
            io,
            props: {
              target: ROUND_TARGET,
              total: CURRENT_BALANCE,
            },
          })

          winnerSubject.notify({
            io,
            props: winner?.data,
          })
        } catch (error) {
          console.log(`[Nenhum ganhador válido]: ${error}`)
          io.emit(SocketEnum.ROUND_WINNER, {})
        }
      }
    },
    CHECK_BALANCE_INTERVAL,
    { stopOnError: false }
  )

  const allParticipants = await participantService.getAllParticipants()

  if (allParticipants?.data) {
    MINING_USERS = allParticipants.data.length
  }

  io.on(SocketEnum.CONNECT, async (socket: Socket) => {
    const socketId = socket.id
    ONLINE_USERS = io.of('/').sockets.size
    console.log('CONNECT', socketId)

    io.emit(SocketEnum.ONLINE_USERS, {
      onlineUsers: ONLINE_USERS,
      miningUsers: MINING_USERS,
    })

    /**
     * Emit balance on connect
     */
    socket.emit(SocketEnum.TOTAL_BALANCE, {
      total: CURRENT_BALANCE,
      target: ROUND_TARGET,
    })

    socket.on(SocketEnum.JOIN_ROUND, async data => {
      const { userId } = data

      console.log('JOIN_ROUND', data)
      const res = await participantService.add(userId, socketId)

      if (res.notification.success) {
        MINING_USERS++
        ONLINE_USERS = io.of('/').sockets.size

        socket.emit(SocketEnum.JOIN_SUCCESS, 'Você entrou na rodada.')

        io.emit(SocketEnum.ONLINE_USERS, {
          onlineUsers: ONLINE_USERS,
          miningUsers: MINING_USERS,
        })
      } else if (!res.notification.success)
        socket.emit(SocketEnum.JOIN_FAILED, res.notification.message)
    })

    socket.on(SocketEnum.LEAVE_ROUND, async data => {
      const { userId } = data

      if (MINING_USERS > 0) {
        MINING_USERS--
      }

      ONLINE_USERS = io.of('/').sockets.size

      io.emit(SocketEnum.ONLINE_USERS, {
        onlineUsers: ONLINE_USERS,
        miningUsers: MINING_USERS,
      })

      console.log('LEAVE_ROUND', data)
      await participantService.delete(userId, socketId)
    })

    socket.on('disconnect', async () => {
      console.log('DISCONNECTED', socketId)
      ONLINE_USERS = io.of('/').sockets.size

      const deletedParticipant = await participantService.delete(null, socketId)

      if (deletedParticipant.notification.success) {
        if (MINING_USERS > 0) {
          MINING_USERS--
        }
      }

      io.emit(SocketEnum.ONLINE_USERS, {
        onlineUsers: ONLINE_USERS,
        miningUsers: MINING_USERS,
      })
    })
  })
}

export { sockets }
