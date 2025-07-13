import { BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator'

export class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  POSTGRES_HOST: string
  POSTGRES_USER: string
  POSTGRES_PASSWORD: string
  POSTGRES_DB_NAME: string
  POSTGRES_URI: string

  @IsNotEmpty()
  @IsNumber()
  POSTGRES_PORT: number
  POSTGRES_INTERNAL_PORT: number
  POSTGRES_EXTERNAL_PORT: number

  @IsNotEmpty()
  @IsString()
  // TOKENS
  ACCESS_TOKEN_SECRET: string
  REFRESH_TOKEN_SECRET: string
  ACCESS_TOKEN_LIFETIME: string
  REFRESH_TOKEN_LIFETIME: string
  COOKIE_SECRET: string
  SALT_ROUNDS: string
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  })

  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new BadRequestException(errors.toString())
  }

  return validatedConfig
}
