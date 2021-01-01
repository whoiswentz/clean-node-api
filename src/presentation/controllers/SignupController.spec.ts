import { SignupController } from './SignupController'
import faker from 'faker'
import Validator from '../protocols/validator'
import ServerError from '../errors/server-error'

interface SutTypes {
  sut: SignupController
  emailValidator: Validator<string>
}

const makeSut = (): SutTypes => {
  class EmailValidator implements Validator<string> {
    public async validate (email: string): Promise<Boolean> {
      return true
    }
  }

  const emailValidator = new EmailValidator()
  const sut = new SignupController(emailValidator)
  return {
    sut,
    emailValidator
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
    expect(response.body).toEqual(new Error('Missing param: name'))
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
    expect(response.body).toEqual(new Error('Missing param: email'))
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
    expect(response.body).toEqual(new Error('Missing param: password'))
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
    expect(response.body).toEqual(new Error('Missing param: passwordConfirmation'))
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
    expect(response.body).toEqual(new Error('Invalid param: email'))
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
})
