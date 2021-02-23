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
import { IEmit } from './interfaces/IEmit'
import { IOnlineUsers } from './interfaces/IOnlineUsers'
import { emitOnlineUsers } from './events/emitOnlineUsers'
import { WinnerService } from './services/implementations/WinnerService'

const winnerSubject = Observable<IEmit<IUser | undefined | Record<string, unknown>>>()
const balanceSubject = Observable<IEmit<IBalance | undefined>>()
const onlineUsersSubject = Observable<IEmit<IOnlineUsers>>()

winnerSubject.subscribe(emitWinner)
balanceSubject.subscribe(emitBalance)
onlineUsersSubject.subscribe(emitOnlineUsers)

const participantService = new ParticipantService()
const coinimpService = new CoinIMPService()
const winnerService = new WinnerService()

const state = {
  ONLINE_USERS: 0,
  MINING_USERS: 0,
  CURRENT_BALANCE: 0,
  VALID_TARGETS: [0.2, 0.3, 0.4, 0.5],
  ROUND_TARGET: 1,
  ROUND_DURATION: 1200_000, // 20min in milisec
  CHECK_BALANCE_INTERVAL: 30000
}

/**
 *
 * Initial dynamic target
 */

state.ROUND_TARGET = state.VALID_TARGETS[Math.floor(Math.random() * state.VALID_TARGETS.length)]

console.log('[Initial Dynamic Target]', state.ROUND_TARGET)

const sockets = async (io: SocketIO.Server): Promise<void> => {
  const cleanupInactiveParticipants = async (shouldEmitRestart = false) => {
    console.log(`[Participant Cleanup] Initializing safety cleanup`)
    const allParticipantSocketsList = await participantService.getParticipantAllSockets()
    const allSocketIoListRaw = await io.allSockets()
    const allSocketIoList: string[] = []

    allSocketIoListRaw.forEach(socketValue => allSocketIoList.push(socketValue))

    if (allParticipantSocketsList?.data) {
      const allParticipantSockets = allParticipantSocketsList.data

      allParticipantSockets.forEach(participantSocket => {
        if (!allSocketIoList.includes(participantSocket)) {
          /**
           * User not connected anymore - we should clean it from the participants collection
           */

          console.log(
            `[Participant Cleanup] Participant with socket ${participantSocket} is not connected anymore, removing it from participants list`
          )

          participantService.delete(
            null,
            async () => {
              console.log(
                `[Participant Cleanup] Successfully removed participant with socket ${participantSocket}`
              )
            },
            participantSocket
          )
        }
      })

      if (shouldEmitRestart) {
        io.emit(SocketEnum.SERVER_RESTART, {})
      }

      /**
       * Update mining users count
       */
      const allParticipants = await participantService.getParticipantLenght()
      if (allParticipants?.data) {
        state.MINING_USERS = allParticipants.data
      }

      onlineUsersSubject.notify({
        io,
        props: {
          onlineUsers: state.ONLINE_USERS,
          miningUsers: state.MINING_USERS
        }
      })
    }
  }

  /**
   * Initial balance fetch
   */
  try {
    const balance = await coinimpService.getBalance()
    const { message } = balance
    state.CURRENT_BALANCE = parseFloat(message)

    /**
     * Emit blue notification if balance matches on start
     */
    if (state.CURRENT_BALANCE >= state.ROUND_TARGET) {
      console.log(`[Sufficient Balance]: Will pick a winner in the first interval iteration`)
      balanceSubject.notify({
        io,
        props: {
          target: state.ROUND_TARGET,
          total: state.CURRENT_BALANCE
        }
      })
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

      state.CURRENT_BALANCE = parseFloat(message)

      balanceSubject.notify({
        io,
        props: {
          target: state.ROUND_TARGET,
          total: state.CURRENT_BALANCE
        }
      })

      if (state.CURRENT_BALANCE >= state.ROUND_TARGET) {
        const winner = await participantService.getParticipantByTime(state.ROUND_DURATION)

        try {
          const walletAddress = winner?.data?.walletAddress
          const totalToPay = ((90 / 100) * state.ROUND_TARGET).toFixed(8)
          const totalTax = ((10 / 100) * state.ROUND_TARGET).toFixed(8)

          if (!walletAddress) {
            console.log(`[Nenhum ganhador válido]: nenhum endereço de wallet retornado`)
            winnerSubject.notify({
              io,
              props: {}
            })

            return
          }

          /**
           * Pay the winner
           */
          const receipt = await coinimpService.payout(walletAddress, totalToPay)
          console.log('[Payment Receipt]: ', receipt)

          if (receipt.status === 'error') {
            /**
             * Will grab another winner in 15s
             */
            winnerSubject.notify({
              io,
              props: {}
            })

            return
          }

          /**
           * Refetch balance
           */
          const balance = await coinimpService.getBalance()
          const { message } = balance
          state.CURRENT_BALANCE = parseFloat(message)

          /**
           *
           * set the new dynamic target
           */

          const targetsWithoutCurrent = state.VALID_TARGETS.filter(
            validTarget => validTarget !== state.ROUND_TARGET
          )

          state.ROUND_TARGET =
            targetsWithoutCurrent[Math.floor(Math.random() * targetsWithoutCurrent.length)]

          console.log('[New Dynamic Target]', state.ROUND_TARGET)

          balanceSubject.notify({
            io,
            props: {
              target: state.ROUND_TARGET,
              total: state.CURRENT_BALANCE
            }
          })

          winnerSubject.notify({
            io,
            props: winner?.data
          })

          // update last winners collection and send to front
          if (receipt.paidAmount && receipt.blockchainReceipt) {
            await winnerService.add({
              amount: receipt.paidAmount,
              transactionId: receipt.blockchainReceipt,
              userId: winner?.data?.id
            })

            const lastWinners = await winnerService.list()

            io.emit(SocketEnum.LAST_WINNERS, { lastWinners })
          }

          cleanupInactiveParticipants()

          /**
           * Success payout, now grab the administration tax
           */

          if (process.env.MINTME_WALLET)
            await coinimpService.payout(process.env.MINTME_WALLET, totalTax)
        } catch (error) {
          console.log(`[Nenhum ganhador válido]: ${error}`)
          winnerSubject.notify({
            io,
            props: {}
          })
        }
      }
    },
    state.CHECK_BALANCE_INTERVAL,
    { stopOnError: false }
  )

  const allParticipants = await participantService.getParticipantLenght()

  if (allParticipants?.data) {
    state.MINING_USERS = allParticipants.data
  } else {
    state.MINING_USERS = 0
  }

  cleanupInactiveParticipants(true)

  // CONNECT
  io.on(SocketEnum.CONNECT, async (socket: Socket) => {
    const socketId = socket.id
    state.ONLINE_USERS = io.of('/').sockets.size
    console.log('CONNECT', socketId)

    onlineUsersSubject.notify({
      io,
      props: {
        onlineUsers: state.ONLINE_USERS,
        miningUsers: state.MINING_USERS
      }
    })

    /**
     * Emit balance on connect
     */
    socket.emit(SocketEnum.TOTAL_BALANCE, {
      total: state.CURRENT_BALANCE,
      target: state.ROUND_TARGET
    })

    /**
     * Emit last winners on connect
     */
    const lastWinners = await winnerService.list()
    socket.emit(SocketEnum.LAST_WINNERS, { lastWinners })

    // JOIN_ROUND
    socket.on(SocketEnum.JOIN_ROUND, async data => {
      const { userId } = data

      console.log('JOIN_ROUND', data)
      const res = await participantService.add(userId, socketId)

      if (res.notification.success) {
        socket.emit(SocketEnum.JOIN_SUCCESS, 'Você entrou na rodada.')

        state.ONLINE_USERS = io.of('/').sockets.size

        /**
         * Update mining users count
         */
        const allParticipants = await participantService.getParticipantLenght()
        if (allParticipants?.data) {
          state.MINING_USERS = allParticipants.data
        }

        onlineUsersSubject.notify({
          io,
          props: {
            onlineUsers: state.ONLINE_USERS,
            miningUsers: state.MINING_USERS
          }
        })
      } else if (!res.notification.success)
        socket.emit(SocketEnum.JOIN_FAILED, res.notification.message)
    })

    // LEAVE_ROUND
    socket.on(SocketEnum.LEAVE_ROUND, async data => {
      const { userId } = data

      state.ONLINE_USERS = io.of('/').sockets.size

      console.log('LEAVE_ROUND', data)

      participantService.delete(
        userId,
        async () => {
          /**
           * Update mining users count
           */
          const allParticipants = await participantService.getParticipantLenght()
          if (allParticipants?.data) {
            state.MINING_USERS = allParticipants.data
          }

          onlineUsersSubject.notify({
            io,
            props: {
              onlineUsers: state.ONLINE_USERS,
              miningUsers: state.MINING_USERS
            }
          })
        },
        socketId
      )

      console.log('[Leave round] After trying to delete participant log :)')
    })

    // DISCONNECT
    socket.on('disconnect', async () => {
      console.log('DISCONNECTED', socketId)
      state.ONLINE_USERS = io.of('/').sockets.size

      participantService.delete(
        null,
        async () => {
          /**
           * Update mining users count
           */
          const allParticipants = await participantService.getParticipantLenght()
          if (allParticipants?.data) {
            state.MINING_USERS = allParticipants.data
          }

          onlineUsersSubject.notify({
            io,
            props: {
              onlineUsers: state.ONLINE_USERS,
              miningUsers: state.MINING_USERS
            }
          })
        },
        socketId
      )

      console.log('[Disconnect] After trying to delete participant log :)')
    })
  })
}

export { sockets }
