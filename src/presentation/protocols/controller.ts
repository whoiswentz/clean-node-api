export interface Controller<T, O> {
  handle(httpRequest: T): Promise<O>
}
