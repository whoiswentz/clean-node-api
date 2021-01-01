import { HttpResponse } from '../../protocols/http'

export const internalServerError = <T extends Error>(error: T): HttpResponse<any> => ({
  statusCode: 500,
  body: error
})
