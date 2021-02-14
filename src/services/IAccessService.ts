import { AxiosResponse } from 'axios'

export interface IAccessService {
  login(name: string, password: string): Promise<AxiosResponse>
}
