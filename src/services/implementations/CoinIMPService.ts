import { coinimpApi } from '../../apis/coinimpApi'
import { CoinimpEndpointEnum } from '../../enums/CoinimpEndpointEnum'
import { ICoinIMPBalance } from '../../interfaces/ICoinIMPBalance'
import { ICoinIMPService } from '../ICoinIMPService'

export class CoinIMPService implements ICoinIMPService {
  async getBalance(): Promise<ICoinIMPBalance> {
    try {
      const axiosRes = await coinimpApi.get(CoinimpEndpointEnum.BALANCE)

      return axiosRes.data
    } catch (error) {
      throw new Error(error.response.data)
    }
  }
}
