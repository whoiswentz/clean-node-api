import MissingParamError from '../errors/missing-param'
import badRequest from '../helpers/http/bad-request'
import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'
import Validator from '../protocols/validator'
export class SignupController implements Controller<HttpRequest, HttpResponse<any>> {
  constructor (
    private readonly emailValidator: Validator<string>
  ) {}

  public async handle (httpRequest: HttpRequest): Promise<HttpResponse<any>> {
    const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }

    return {
      statusCode: 500,
      body: new Error('Internal')
    }
  }
}
