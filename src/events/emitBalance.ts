import { SocketEnum } from '../enums/SocketEnum'
import { IBalance } from '../interfaces/IBalance'
import { IEmit } from '../interfaces/IEmit'

export const emitBalance = ({ io, props }: IEmit<IBalance | undefined>): void => {
  if (!props?.target && !props?.total) {
    io.emit(SocketEnum.TOTAL_BALANCE, {})
  } else {
    io.emit(SocketEnum.TOTAL_BALANCE, {
      total: props?.total,
      target: props?.target,
    })
  }
}
