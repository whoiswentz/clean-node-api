import { ServerError, InvalidParamError, MissingParamError } from '../errors'
import { badRequest, internalServerError } from '../helpers/http'
import { HttpRequest, HttpResponse, Validator, Controller } from '../protocols'

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

      if (httpRequest.body.password !== httpRequest.body.passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
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
