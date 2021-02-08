import { IParticipant } from '../../interfaces/IParticipant'
import { IParticipantService } from '../IParticipantService'
import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { AxiosResponse } from 'axios'

export class ParticipantService implements IParticipantService {
  async add(userId: any, socketId: any): Promise<AxiosResponse> {
    try {
      const res = await lotocriptoApi.post('/participants', { userId, socketId })
      return res.data
    } catch (error) {
      throw new Error(error)
    }
  }

  async update(id: any, participant: IParticipant): Promise<AxiosResponse> {
    try {
      const res = await lotocriptoApi.put('/participants', { id, ...participant })

      return res.data
    } catch (error) {
      throw new Error(error)
    }
  }
}
