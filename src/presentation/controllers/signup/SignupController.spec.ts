import { SignupController } from './SignupController'
import faker from 'faker'
import { HttpRequest, Validator } from '../../protocols'
import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { AddAccount, AddAccountModel } from '../../../domain/usecases/add-account'
import { AccountModel } from '../../../domain/models/account'
import { SignupModel } from '../../../domain/models/signupmodel'

interface SutTypes {
  sut: SignupController
  signupValidatorAdapterStub: Validator<SignupModel>
  addAccountStub: AddAccount
}

const makeSut = (): SutTypes => {
  class SignupValidatorAdapterStub implements Validator<SignupModel> {
    public async validate (email: SignupModel): Promise<SignupModel> {
      return email
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

  const signupValidatorAdapterStub = new SignupValidatorAdapterStub()
  const addAccountStub = new AddAccountStub()
  const sut = new SignupController(signupValidatorAdapterStub, addAccountStub)
  return {
    sut,
    signupValidatorAdapterStub,
    addAccountStub
  }
}

describe('Signup Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')
      .mockRejectedValue(new MissingParamError('name'))

    const password = faker.internet.password()
    const httpRequest: HttpRequest<any> = {
      body: {
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(mockValidate).toBeCalledWith(httpRequest.body)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('name'))
  })

  test('Should return 400 if no email is provided', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')
      .mockRejectedValue(new MissingParamError('email'))

    const password = faker.internet.password()
    const httpRequest: HttpRequest<any> = {
      body: {
        name: faker.name.firstName(),
        password,
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(mockValidate).toBeCalledWith(httpRequest.body)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')
      .mockRejectedValue(new MissingParamError('password'))

    const password = faker.internet.password()
    const httpRequest: HttpRequest<any> = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        passwordConfirmation: password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(mockValidate).toBeCalledWith(httpRequest.body)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 400 if no passwordConfirmation is provided', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')
      .mockRejectedValue(new MissingParamError('passwordConfirmation'))

    const password = faker.internet.password()
    const httpRequest: HttpRequest<any> = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password
      }
    }

    const response = await sut.handle(httpRequest)
    expect(mockValidate).toBeCalledWith(httpRequest.body)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('Should return 400 if no password confirmation fails', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')
      .mockRejectedValue(new InvalidParamError('passwordConfirmation'))

    const httpRequest = {
      body: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        passwordConfirmation: faker.internet.password()
      }
    }

    const response = await sut.handle(httpRequest)
    expect(mockValidate).toBeCalledWith(httpRequest.body)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  test('Should return 400 if invalid email is provided', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate').mockRejectedValue(new InvalidParamError('email'))

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

    expect(mockValidate).toBeCalledWith(httpRequest.body)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 500 if emailValidator throws', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')
      .mockRejectedValue(new Error('Error'))

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

    expect(mockValidate).toBeCalledWith(httpRequest.body)

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual(new ServerError('Error'))
  })

  test('Should call signupBodyValidator with correct email', async () => {
    const {
      sut,
      signupValidatorAdapterStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')

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

    expect(mockValidate).toBeCalledWith(httpRequest.body)
  })

  test('Should call AddAccountUsecase with correct params', async () => {
    const {
      sut,
      addAccountStub
    } = makeSut()

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
    const {
      sut,
      addAccountStub
    } = makeSut()

    const mockUseCase = jest.spyOn(addAccountStub, 'add')
      .mockRejectedValue(new Error('Error'))

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

    expect(mockUseCase).toBeCalledWith({
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual(new ServerError('Error'))
  })

  test('Should return 200 with valid data is provided', async () => {
    const {
      sut,
      signupValidatorAdapterStub,
      addAccountStub
    } = makeSut()

    const mockValidate = jest.spyOn(signupValidatorAdapterStub, 'validate')
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

    expect(mockValidate).toBeCalledWith(httpRequest.body)
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
