export interface ICoinIMPBalance {
  message: {
    name: string
    hashrate: number
    hashes: number
    reward: string
  }
  status: string
}
