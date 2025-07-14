export interface IAuthRequestDto {
  email: string
  password: string
}

export type ISignInRequestDto = {
  email?: string
  username?: string
  password: string
}

export interface ISignUpRequestDto extends IAuthRequestDto {
  terms: boolean
}
