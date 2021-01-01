import ServerError from '../errors/server-error'
import InvalidParamError from '../errors/invalid-param'
import MissingParamError from '../errors/missing-param'
import badRequest from '../helpers/http/bad-request'
import internalServerError from '../helpers/http/internal-server-error'
import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'
import Validator from '../protocols/validator'

export class SignupController implements Controller<HttpRequest, HttpResponse<any>> {
  constructor (
    private readonly emailValidator: Validator<string>
  ) {}

  public async handle (httpRequest: HttpRequest): Promise<HttpResponse<any>> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const isEmailValid = await this.emailValidator.validate(httpRequest.body.email)
      if (!isEmailValid) {
        return badRequest(new InvalidParamError('email'))
      }

      return {
        statusCode: 500,
        body: new Error('Internal')
      }
    } catch (error) {
      return internalServerError(new ServerError(error.message))
    }
  }
}
