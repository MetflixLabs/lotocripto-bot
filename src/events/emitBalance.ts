import { SocketEnum } from '../enums/SocketEnum'
import { IBalance } from '../interfaces/IBalance'
import { IEmit } from '../interfaces/IEmit'

export const emitBalance = (data: IEmit<IBalance>): void => {
  const { io, props } = data

  io.emit(SocketEnum.TOTAL_BALANCE, {
    total: props.total,
    target: props.target
  })
}
