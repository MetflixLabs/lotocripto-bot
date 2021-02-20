import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { LotocriptoEndpointEnum } from '../../enums/LotocriptoEndpointEnum'
import { IOutputResult } from '../../interfaces/IOutputResult'
import { IWinnerRequest, IWinnerResponse } from '../../interfaces/IWinner'
import { IWinnerService } from '../IWinnerService'

export class WinnerService implements IWinnerService {
  async add(winner: IWinnerRequest): Promise<IOutputResult<undefined>> {
    try {
      const res = await lotocriptoApi.post(
        LotocriptoEndpointEnum.WINNERS,
        { winner },
        { withCredentials: true }
      )

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }

  async list(page?: number, limit?: number): Promise<IOutputResult<IWinnerResponse>> {
    try {
      const res = await lotocriptoApi.get(LotocriptoEndpointEnum.WINNERS, {
        params: {
          page,
          limit,
        },
        withCredentials: true,
      })

      return res.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }
}
