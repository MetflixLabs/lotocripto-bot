import { SocketEnum } from '../enums/SocketEnum'
import { IEmit } from '../interfaces/IEmit'
import { IOnlineUsers } from '../interfaces/IOnlineUsers'

export const emitOnlineUsers = ({ io, props }: IEmit<IOnlineUsers>): void => {
  io.emit(SocketEnum.ONLINE_USERS, {
    onlineUsers: props.onlineUsers,
    miningUsers: props.miningUsers,
  })
}
