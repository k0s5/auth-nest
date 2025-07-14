import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator'

import { ISignInRequestDto } from '../types'

export class SignInRequestBody implements ISignInRequestDto {
  @ValidateIf((o: { username: string }) => !o.username) // email is required, if username is not defined
  @IsNotEmpty({ message: 'Email is required if username is not provided' })
  @IsEmail()
  email?: string

  @ValidateIf((o: { email: string }) => !o.email) // username is required, if email is not defined
  @IsNotEmpty({ message: 'Username is required if email is not provided' })
  username?: string

  @IsNotEmpty()
  @IsString()
  password: string
}
