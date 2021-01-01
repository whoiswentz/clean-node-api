import { HttpResponse } from '../../protocols/http'

export const badRequest = <T extends Error> (error: T): HttpResponse<any> => ({
  statusCode: 400,
  body: error
})
