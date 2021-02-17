import { ICoinIMPBalance } from '../interfaces/ICoinIMPBalance'

export interface ICoinIMPService {
  getBalance(): Promise<ICoinIMPBalance>
}
