import { AxiosResponse } from 'axios'
import { IParticipant } from '../interfaces/IParticipant'

export interface IParticipantService {
  add(userId: any, socketId: any): Promise<AxiosResponse>
  update(id: any, participant: IParticipant): Promise<AxiosResponse>
}
