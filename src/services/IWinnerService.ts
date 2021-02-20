import { IOutputResult } from '../interfaces/IOutputResult'
import { IWinnerRequest } from '../interfaces/IWinner'

export interface IWinnerService {
  add(winner: IWinnerRequest): Promise<IOutputResult<undefined>>
}
