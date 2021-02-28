import { IOutputResult } from '../interfaces/IOutputResult'
import { IParticipant } from '../interfaces/IParticipant'
import { IUser } from '../interfaces/IUser'

export interface IParticipantService {
  add(userId: string, socketId: string): Promise<IOutputResult<IParticipant>>
  update(id: string, participant: IParticipant): Promise<IOutputResult<IParticipant>>
  delete(
    userId: unknown,
    updateCounter: () => Promise<void>,
    socketId?: string
  ): Promise<IOutputResult<IParticipant> | undefined>
  getParticipantByTime(uptime: string): Promise<IOutputResult<IUser> | null>
  getParticipantLenght(): Promise<IOutputResult<number> | null>
}
