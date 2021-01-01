import { HttpResponse } from '../../protocols/http'

export default <T extends Error>(error: T): HttpResponse<any> => ({
  statusCode: 500,
  body: error
})
