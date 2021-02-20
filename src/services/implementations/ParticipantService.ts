import { IParticipant } from '../../interfaces/IParticipant'
import { IParticipantService } from '../IParticipantService'
import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { LotocriptoEndpointEnum } from '../../enums/LotocriptoEndpointEnum'
import { IOutputResult } from '../../interfaces/IOutputResult'
import { IUser } from '../../interfaces/IUser'

export class ParticipantService implements IParticipantService {
  async add(userId: string, socketId: string): Promise<IOutputResult<IParticipant>> {
    try {
      const res = await lotocriptoApi.post(
        LotocriptoEndpointEnum.PARTICIPANTS,
        { userId, socketId },
        { withCredentials: true }
      )

      return res.data
    } catch (error) {
      return error.response.data
    }
  }

  async update(id: string, participant: IParticipant): Promise<IOutputResult<IParticipant>> {
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

  async delete(userId: unknown, socketId?: string): Promise<IOutputResult<IParticipant>> {
    try {
      const res = await lotocriptoApi.delete(LotocriptoEndpointEnum.PARTICIPANTS, {
        data: { userId, socketId },
        withCredentials: true
      })

      return res.data
    } catch (error) {
      return error.response.data
    }
  }

  async getParticipantByTime(uptime: number): Promise<IOutputResult<IUser> | null> {
    try {
      const res = await lotocriptoApi.get(LotocriptoEndpointEnum.ELEGIBLE, {
        params: {
          uptime
        },
        withCredentials: true
      })

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }

  async getParticipantLenght(): Promise<IOutputResult<number> | null> {
    try {
      const res = await lotocriptoApi.get(LotocriptoEndpointEnum.PARTICIPANTS, {
        withCredentials: true
      })

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }
}
