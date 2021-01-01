export default class InvalidParamError extends Error {
  constructor (entity: string) {
    super(`Invalid param: ${entity}`)
    this.name = InvalidParamError.name
  }
}
