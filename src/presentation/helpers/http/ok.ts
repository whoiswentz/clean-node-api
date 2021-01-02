import { HttpResponse } from '../../protocols'

export const ok = (data: any): HttpResponse<any> => ({
  statusCode: 200,
  body: data
})
