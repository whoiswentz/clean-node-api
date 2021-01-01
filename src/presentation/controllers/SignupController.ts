import { ServerError, InvalidParamError, MissingParamError } from '../errors'
import { badRequest, internalServerError } from '../helpers/http'
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
