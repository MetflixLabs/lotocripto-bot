import interval from 'interval-promise'
import { CoinIMPService } from '../services/implementations/CoinIMPService'

export const roundHandler = (roundTarget = 10): Promise<boolean> => {
  const coinimpService = new CoinIMPService()

  return new Promise((resolve, reject) => {
    interval(async () => {
      const res = await coinimpService.getBalance()

      const balance = parseFloat(res.message)

      if (balance > roundTarget) return resolve(true)
    }, 3000)
  })
}
