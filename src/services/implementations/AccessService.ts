import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { LotocriptoEndpointEnum } from '../../enums/LotocriptoEndpointEnum'
import { IOutputResult } from '../../interfaces/IOutputResult'
import { IAccessService } from '../IAccessService'

export class AccessService implements IAccessService {
  async login(name: string, password: string): Promise<IOutputResult> {
    try {
      const axiosRes = await lotocriptoApi.post(LotocriptoEndpointEnum.LOGIN, { name, password })

      return axiosRes.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }
}
