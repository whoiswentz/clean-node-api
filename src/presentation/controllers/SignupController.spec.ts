import { SignupController } from './SignupController'
import faker from 'faker'
import { Validator } from '../protocols'
import { ServerError, MissingParamError, InvalidParamError } from '../errors'
import { AddAccount, AddAccountModel } from '../../domain/usecases/add-account'
import { AccountModel } from '../../domain/models/account'
interface SutTypes {
  sut: SignupController
  emailValidator: Validator<string>
  addAccountStub: AddAccount
}

const makeSut = (): SutTypes => {
  class EmailValidator implements Validator<string> {
    public async validate (email: string): Promise<Boolean> {
      return true
    }
  }

  class AddAccountStub implements AddAccount {
    public async add (account: AddAccountModel): Promise<AccountModel> {
      return {
        id: 'id',
        name: account.name,
        email: account.email,
        password: account.password
      }
    }
  }

  const emailValidator = new EmailValidator()
  const addAccountStub = new AddAccountStub()
  const sut = new SignupController(emailValidator, addAccountStub)
  return {
    sut,
    emailValidator,
    addAccountStub
  }
}

describe('Signup Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    const { sut } = makeSut()

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('name'))
  })

  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 400 if no passwordConfirmation is provided', async () => {
    const { sut } = makeSut()

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('Should return 400 if no password confirmation fails', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        passwordConfirmation: faker.internet.password()
      }
    }

    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  test('Should return 400 if invalid email is provided', async () => {
    const { sut, emailValidator } = makeSut()

    const mockEmailValidator = jest.spyOn(emailValidator, 'validate').mockResolvedValue(false)

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)

    expect(mockEmailValidator).toBeCalled()

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 500 if emailValidator throws', async () => {
    const { sut, emailValidator } = makeSut()

    const mockEmailValidator = jest.spyOn(emailValidator, 'validate').mockRejectedValue(new Error('Error'))

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)

    expect(mockEmailValidator).toBeCalled()

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual(new ServerError('Error'))
  })

  test('Should call emailValidator with correct email', async () => {
    const { sut, emailValidator } = makeSut()

    const mockEmailValidator = jest.spyOn(emailValidator, 'validate')

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    await sut.handle(httpRequest)

    expect(mockEmailValidator).toBeCalled()
  })

  test('Should call AddAccountUsecase with correct params', async () => {
    const { sut, addAccountStub } = makeSut()

    const mockAddAccount = jest.spyOn(addAccountStub, 'add')

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    await sut.handle(httpRequest)

    expect(mockAddAccount).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })
  })

  test('Should return 500 if emailValidator throws', async () => {
    const { sut, addAccountStub } = makeSut()

    const mockEmailValidator = jest.spyOn(addAccountStub, 'add').mockRejectedValue(new Error('Error'))

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)

    expect(mockEmailValidator).toBeCalled()

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual(new ServerError('Error'))
  })

  test('Should return 200 with valid data is provided', async () => {
    const { sut, emailValidator, addAccountStub } = makeSut()

    const mockEmailValidator = jest.spyOn(emailValidator, 'validate')
    const mockAddAccount = jest.spyOn(addAccountStub, 'add')

    const password = faker.internet.password()
    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)

    expect(mockEmailValidator).toBeCalledWith(httpRequest.body.email)
    expect(mockAddAccount).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      id: 'id',
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })
  })
})
