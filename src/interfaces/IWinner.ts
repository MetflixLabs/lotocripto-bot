export interface IWinnerRequest {
  id?: string
  userId: string
  transactionId: string
  amount: number
}

export interface IWinnerResponse {
  id?: string
  name: string
  transactionId: string
  amount: number
  date: Date
}
