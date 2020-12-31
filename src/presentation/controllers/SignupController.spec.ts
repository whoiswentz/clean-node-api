import { SignupController } from './SignupController'
import faker from 'faker'

describe('Signup Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    const sut = new SignupController()

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
    expect(response.body).toEqual(new Error('Missing param: name'))
  })
})
