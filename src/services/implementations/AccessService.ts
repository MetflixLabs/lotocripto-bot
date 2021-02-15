import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { EndpointEnum } from '../../enums/EndpointEnum'
import { IOutputResult } from '../../interfaces/IOutputResult'

export class AccessService {
  async login(name: string, password: string): Promise<IOutputResult> {
    try {
      const axiosRes = await lotocriptoApi.post(EndpointEnum.LOGIN, { name, password })

      return axiosRes.data
    } catch (error) {
      throw new Error(error.response.data.notification.message)
    }
  }
}
