import { AxiosResponse } from 'axios'
import { IParticipant } from '../interfaces/IParticipant'

export interface IParticipantService {
  add(userId: string, socketId: string): Promise<AxiosResponse>
  update(id: string, participant: IParticipant): Promise<AxiosResponse>
}
