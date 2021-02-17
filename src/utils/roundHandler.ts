import interval from 'interval-promise'
import { CoinIMPService } from '../services/implementations/CoinIMPService'

export const roundHandler = (roundTarget = 10): Promise<boolean> => {
  const coinimpService = new CoinIMPService()

  return new Promise((resolve, reject) => {
    interval(async () => {
      const res = await coinimpService.getBalance()

      const balance = parseFloat(res.message.reward)

      if (balance > 10) return resolve(true)
    }, 3000)
  })
}
