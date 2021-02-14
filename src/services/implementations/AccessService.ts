import { AxiosResponse } from 'axios'
import { lotocriptoApi } from '../../apis/lotocriptoApi'
import { EndpointEnum } from '../../enums/EndpointEnum'

export class AccessService {
  async login(name: string, password: string): Promise<AxiosResponse> {
    try {
      const res = await lotocriptoApi.post(EndpointEnum.PARTICIPANTS, { name, password })

      return res.data
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
