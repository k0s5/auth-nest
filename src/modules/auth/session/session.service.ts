import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { ITokenPayload } from '@shared/types'

import { EnvironmentVariables } from '@/core/config/env.validation'
import { PrismaService } from '@/core/prisma'
import { addTimeToDate } from '@/shared/utils'

@Injectable()
export class SessionService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async create(input: {
    userId: string
    fingerprint: string
    accessToken: string
    refreshToken: string
  }) {
    const { accessToken, fingerprint, refreshToken, userId } = input

    const expiresAt = addTimeToDate(
      this.configService.getOrThrow<string>('REFRESH_TOKEN_LIFETIME')
    )

    return await this.prisma.session.create({
      data: {
        userId,
        fingerprint,
        accessToken,
        refreshToken,
        expiresAt
      }
    })
  }

  async delete(refreshToken: string) {
    await this.prisma.session.delete({
      where: {
        refreshToken
      }
    })
  }

  async generateTokens(tokenPayload: ITokenPayload) {
    const { email, userId, username } = tokenPayload

    const accessTokenPayload = {
      email,
      userId,
      username
    }

    const refreshTokenPayload = {
      email,
      userId,
      username
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: this.configService.getOrThrow<string>(
          'ACCESS_TOKEN_LIFETIME'
        )
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: this.configService.getOrThrow<string>(
          'REFRESH_TOKEN_LIFETIME'
        )
      })
    ])

    return {
      accessToken,
      refreshToken
    }
  }
}
