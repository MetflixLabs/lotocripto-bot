import { ICoinIMPBalance } from '../interfaces/ICoinIMPBalance'
import { ICoinIMPPayout } from '../interfaces/ICoinIMPPayout'

export interface ICoinIMPService {
  getBalance(): Promise<ICoinIMPBalance>
  payout(winnerWallet: string, amount: string): Promise<ICoinIMPPayout>
}
