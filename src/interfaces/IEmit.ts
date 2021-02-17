import SocketIO from 'socket.io'

export interface IEmit<T> {
  io: SocketIO.Server
  props: T
}
