import { AddAccount } from '../../domain/usecases/add-account'
import { ServerError, InvalidParamError, MissingParamError } from '../errors'
import { badRequest, internalServerError } from '../helpers/http'
import { ok } from '../helpers/http/ok'
import { HttpRequest, HttpResponse, Validator, Controller } from '../protocols'

export class SignupController implements Controller<HttpRequest, HttpResponse<any>> {
  constructor (
    private readonly emailValidator: Validator<string>,
    private readonly addAccountUsecase: AddAccount
  ) {}

  public async handle (httpRequest: HttpRequest): Promise<HttpResponse<any>> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const { name, email, password, passwordConfirmation } = httpRequest.body
      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isEmailValid = await this.emailValidator.validate(email)
      if (!isEmailValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const account = await this.addAccountUsecase.add({ name, email, password })

      return ok(account)
    } catch (error) {
      return internalServerError(new ServerError(error.message))
    }
  }
}
