import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

import { IAuthRequestDto } from '../types'

export class SignUpRequestBody implements IAuthRequestDto {
  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsBoolean()
  terms: boolean
}
