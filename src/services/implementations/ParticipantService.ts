import { IParticipant } from '../../interfaces/IParticipant'
import { IParticipantService } from '../IParticipantService'
import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { LotocriptoEndpointEnum } from '../../enums/LotocriptoEndpointEnum'
import { IOutputResult } from '../../interfaces/IOutputResult'

export class ParticipantService implements IParticipantService {
  async add(userId: string, socketId: string): Promise<IOutputResult> {
    try {
      const res = await lotocriptoApi.post(
        LotocriptoEndpointEnum.PARTICIPANTS,
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
        LotocriptoEndpointEnum.PARTICIPANTS,
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
      const res = await lotocriptoApi.delete(LotocriptoEndpointEnum.PARTICIPANTS, {
        data: { userId, socketId },
        withCredentials: true
      })

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }

  async getWinnerByTime(uptime: number): Promise<IOutputResult> {
    try {
      const res = await lotocriptoApi.post(LotocriptoEndpointEnum.PARTICIPANTS, { uptime })

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }
}
