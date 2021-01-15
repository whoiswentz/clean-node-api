import { Validator } from '../../protocols'
import { SignupModel } from '../../../domain/models/signupmodel'
import joi from 'joi'
import { InvalidParamError, MissingParamError } from '../../errors'

const schema = joi.object({
  name: joi.string().required()
    .messages({ 'any.required': 'required' }),
  email: joi.string().email({ tlds: { allow: false } })
    .messages({ 'string.email': 'invalid' }),
  password: joi.string().required()
    .messages({ 'any.required': 'required' }),
  passwordConfirmation: joi.string().valid(joi.ref('password'))
    .required()
    .messages({
      'any.only': 'invalid',
      'any.required': 'required'
    })
}).required().messages({
  'any.required': 'required'
})

export class SignupValidatorAdapter implements Validator<any> {
  public async validate (entity: any): Promise<any> {
    const validation = schema.validate(entity)
    if (validation.error) {
      const [details] = validation.error.details
      switch (details.message) {
        case 'invalid':
          throw new InvalidParamError(details.path[0].toString())
        case 'required':
          throw new MissingParamError(details.path[0].toString())
      }
    }
    return validation.value as SignupModel
  }
}
