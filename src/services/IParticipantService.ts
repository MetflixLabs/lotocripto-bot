import { IOutputResult } from '../interfaces/IOutputResult'
import { IParticipant } from '../interfaces/IParticipant'

export interface IParticipantService {
  add(userId: string, socketId: string): Promise<IOutputResult>
  update(id: string, participant: IParticipant): Promise<IOutputResult>
  deleteBySocketId(socketId: string): Promise<IOutputResult>
}
