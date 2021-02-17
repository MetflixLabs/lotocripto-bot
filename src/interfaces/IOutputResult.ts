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

export interface IOutputResult<T> {
  notification: INotification
  pagination?: IPagination
  data?: T | undefined
}
