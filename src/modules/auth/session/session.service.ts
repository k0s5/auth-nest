import { BadRequestException, Injectable } from '@nestjs/common'
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

  async create(createSessionPayload: {
    userId: string
    fingerprint: string
    accessToken: string
    refreshToken: string
  }) {
    const { accessToken, fingerprint, refreshToken, userId } =
      createSessionPayload

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

  async update(
    currentRefreshToken: string,
    updateSessionPayload: {
      fingerprint: string
      accessToken: string
      refreshToken: string
    }
  ) {
    const { accessToken, fingerprint, refreshToken } = updateSessionPayload

    await this.prisma.session.update({
      data: {
        accessToken,
        fingerprint,
        refreshToken,
        createdAt: new Date(),
        expiresAt: addTimeToDate(
          this.configService.getOrThrow<string>('REFRESH_TOKEN_LIFETIME')
        )
      },
      where: {
        refreshToken: currentRefreshToken
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
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
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

  async verifyToken(
    tokenDto:
      | { accessToken: string; refreshToken?: string }
      | { accessToken?: string; refreshToken: string }
  ) {
    const { accessToken, refreshToken } = tokenDto

    if (!accessToken && !refreshToken) {
      throw new BadRequestException('Tokens missing')
    }

    const token = (accessToken ?? refreshToken) as string

    const secret = this.configService.getOrThrow<string>(
      accessToken ? 'ACCESS_TOKEN_SECRET' : 'REFRESH_TOKEN_SECRET'
    )

    const tokenPayload = await this.jwtService.verifyAsync<ITokenPayload>(
      token,
      { secret }
    )

    return tokenPayload
  }
}
