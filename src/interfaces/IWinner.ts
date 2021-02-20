export interface IWinnerRequest {
  id?: string
  userId: string
  transactionId: string
  amount: string
}

export interface IWinnerResponse {
  id?: string
  name: string
  transactionId: string
  amount: string
  date: Date
}
