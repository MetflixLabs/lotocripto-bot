import { IParticipant } from '../../interfaces/IParticipant'
import { IParticipantService } from '../IParticipantService'
import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { LotocriptoEndpointEnum } from '../../enums/LotocriptoEndpointEnum'
import { IOutputResult } from '../../interfaces/IOutputResult'
import { IUser } from '../../interfaces/IUser'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))
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
      return error.response?.data
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

  async delete(
    userId: unknown,
    updateCounter: () => Promise<void>,
    socketId?: string
  ): Promise<IOutputResult<IParticipant> | undefined> {
    console.log(`[Delete participant] Trying to delete userId ${userId} and socketId ${socketId}`)

    try {
      const res = await lotocriptoApi.delete(LotocriptoEndpointEnum.PARTICIPANTS, {
        data: { userId, socketId },
        withCredentials: true
      })

      console.log(
        `[Delete participant] Successfully deleted with userId ${userId} and socketId ${socketId}`
      )

      updateCounter()

      return res.data
    } catch (error) {
      if (!error.response) {
        // Api failed to execute action, retry
        console.log(
          `[Delete participant] Failed to receive an API response for deleting userId ${userId} and socketId ${socketId} - trying again in 5s`
        )

        await delay(5000)

        this.delete(userId, updateCounter, socketId)

        return
      }

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
      console.log(
        `Error on getting participant by time: ${error.response.data.notification.message}`
      )
      return null
    }
  }

  async getParticipantLenght(): Promise<IOutputResult<number> | null> {
    try {
      const res = await lotocriptoApi.get(LotocriptoEndpointEnum.PARTICIPANTS_LENGTH, {
        withCredentials: true
      })

      return res.data
    } catch (error) {
      return null
    }
  }

  async getParticipantAllSockets(): Promise<IOutputResult<string[]> | null> {
    try {
      const res = await lotocriptoApi.get(LotocriptoEndpointEnum.PARTICIPANTS_ALLSOCKETS, {
        withCredentials: true
      })

      return res.data
    } catch (error) {
      return null
    }
  }
}
