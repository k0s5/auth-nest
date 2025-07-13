export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ITokenPayload {
  email: string
  userId: string
  username: string
  jti?: string // JWT ID for token tracking
  sub?: string // Subject (alternative to jti)
  iat?: number // Issued at
  exp?: number // Expiration time
}
