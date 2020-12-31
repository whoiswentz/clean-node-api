export interface HttpRequest {
  body?: any
}

export interface HttpResponse<T> {
  statusCode: number
  body: T
}
