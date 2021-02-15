import { IParticipant } from '../../interfaces/IParticipant'
import { IParticipantService } from '../IParticipantService'
import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { EndpointEnum } from '../../enums/EndpointEnum'
import { IOutputResult } from '../../interfaces/IOutputResult'

export class ParticipantService implements IParticipantService {
  async add(userId: string, socketId: string): Promise<IOutputResult> {
    try {
      const res = await lotocriptoApi.post(
        EndpointEnum.PARTICIPANTS,
        { userId, socketId },
        { withCredentials: true }
      )

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }

  async update(id: string, participant: IParticipant): Promise<IOutputResult> {
    try {
      const res = await lotocriptoApi.put(
        EndpointEnum.PARTICIPANTS,
        { id, ...participant },
        { withCredentials: true }
      )

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }

  async delete(userId: unknown, socketId?: string): Promise<IOutputResult> {
    try {
      const res = await lotocriptoApi.delete(EndpointEnum.PARTICIPANTS, {
        data: { userId, socketId },
        withCredentials: true
      })

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }
}
