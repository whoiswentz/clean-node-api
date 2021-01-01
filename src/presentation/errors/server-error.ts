export default class ServerError extends Error {
  constructor (msg: string) {
    super(msg)
    this.name = ServerError.name
  }
}
