import { IOutputResult } from '../interfaces/IOutputResult'

export interface IAccessService {
  login(name: string, password: string): Promise<IOutputResult>
}
