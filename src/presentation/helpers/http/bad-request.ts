import { HttpResponse } from '../../protocols/http'

export default <T extends Error> (error: T): HttpResponse<any> => ({
  statusCode: 400,
  body: error
})
