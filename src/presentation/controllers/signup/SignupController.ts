import { AddAccount } from '../../../domain/usecases/add-account'
import { ServerError, InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, internalServerError, ok } from '../../helpers/http'
import { HttpRequest, HttpResponse, Validator, Controller } from '../../protocols'
import { SignupModel } from '../../../domain/models/signupmodel'

export class SignupController implements Controller<HttpRequest<SignupModel>, HttpResponse<any>> {
  constructor (
    private readonly signupBodyValidator: Validator<SignupModel>,
    private readonly addAccountUseCase: AddAccount
  ) {}

  public async handle (httpRequest: HttpRequest<SignupModel>): Promise<HttpResponse<any>> {
    try {
      const { name, email, password } = await this.signupBodyValidator.validate(httpRequest.body)
      const account = await this.addAccountUseCase.add({ name, email, password })

      return ok(account)
    } catch (error) {
      if (error instanceof MissingParamError) {
        return badRequest(error)
      }
      if (error instanceof InvalidParamError) {
        return badRequest(error)
      }
      return internalServerError(new ServerError(error.message))
    }
  }
}
