import { SocketEnum } from '../enums/SocketEnum'
import { IUser } from '../interfaces/IUser'
import { IEmit } from '../interfaces/IEmit'

export const emitWinner = ({ io, props }: IEmit<IUser>): void => {
  io.emit(SocketEnum.ROUND_WINNER, {
    id: props.id,
    name: props.name,
    email: props.email,
    walletAddress: props.walletAddress
  })
}
