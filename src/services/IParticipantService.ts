import { IOutputResult } from '../interfaces/IOutputResult'
import { IParticipant } from '../interfaces/IParticipant'
import { IUser } from '../interfaces/IUser'

export interface IParticipantService {
  add(userId: string, socketId: string): Promise<IOutputResult<IParticipant>>
  update(id: string, participant: IParticipant): Promise<IOutputResult<IParticipant>>
  delete(userId: unknown, socketId?: string): Promise<IOutputResult<IParticipant>>
  getParticipantByTime(uptime: number): Promise<IOutputResult<IUser> | null>
  getParticipantLenght(): Promise<IOutputResult<number> | null>
}
