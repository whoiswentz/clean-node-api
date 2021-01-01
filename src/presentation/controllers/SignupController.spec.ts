import { SignupController } from './SignupController'
import faker from 'faker'
import Validator from '../protocols/validator'

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
        passwordConfirmatiom: password
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
        passwordConfirmatiom: password
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
        passwordConfirmatiom: password
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
})
