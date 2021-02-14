import { IParticipant } from '../../interfaces/IParticipant'
import { IParticipantService } from '../IParticipantService'
import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { AxiosResponse } from 'axios'
import { EndpointEnum } from '../../enums/EndpointEnum'

export class ParticipantService implements IParticipantService {
  async add(userId: string, socketId: string): Promise<AxiosResponse> {
    try {
      const res = await lotocriptoApi.post(EndpointEnum.PARTICIPANTS, { userId, socketId })
      return res.data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async update(id: string, participant: IParticipant): Promise<AxiosResponse> {
    try {
      const res = await lotocriptoApi.put(EndpointEnum.PARTICIPANTS, { id, ...participant })

      return res.data
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteBySocketId(socketId: string): Promise<AxiosResponse> {
    try {
      const res = await lotocriptoApi.delete(EndpointEnum.PARTICIPANTS, { params: { socketId } })

      return res.data
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
