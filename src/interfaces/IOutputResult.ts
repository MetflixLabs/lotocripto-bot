interface IPagination {
  currentPage?: number
  totalPages?: number
  limit?: number
  totalRecords: number
}

interface INotification {
  success: boolean
  message?: string
}

export interface IOutputResult {
  notification: INotification
  pagination?: IPagination
  data?: unknown
}
