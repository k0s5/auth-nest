import { SessionService } from '@modules/auth/session'
import { SetRefreshTokenInterceptor } from '@modules/auth/session/interceptors'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { Request, Response } from 'express'

import { omit } from '@/shared/utils'

import { AccountService } from './account.service'
import { SignInRequestBody, SignUpRequestBody } from './dto'

@Controller()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly sessionService: SessionService
  ) {}

  @UseInterceptors(SetRefreshTokenInterceptor)
  @UsePipes(new ValidationPipe())
  @Post('signup')
  async signUp(
    @Headers('fingerprint') fingerprint: string,
    @Body() dto: SignUpRequestBody
  ) {
    if (!fingerprint) {
      throw new BadRequestException('User fingreprint missing')
    }

    // create user
    const user = await this.accountService.create(dto)

    const { id: userId, email, username } = user

    // generate tokens
    const { accessToken, refreshToken } =
      await this.sessionService.generateTokens({
        email,
        userId,
        username
      })

    if (typeof fingerprint !== 'string') {
      throw new BadRequestException('User fingreprint invalid format')
    }

    // create session
    await this.sessionService.create({
      userId,
      fingerprint,
      accessToken,
      refreshToken
    })

    // set refreshToken cookie
    // cookie initialized in SetRefreshTokenInterceptor interceptor
    return {
      user,
      accessToken,
      refreshToken
    }
  }

  @UseInterceptors(SetRefreshTokenInterceptor)
  @Post('signin')
  async signIn(
    @Headers('fingerprint') fingerprint: string,
    @Body() dto: SignInRequestBody
  ) {
    if (!fingerprint) {
      throw new BadRequestException('User fingreprint missing')
    }

    const { password, email, username } = dto

    //getUserByEmail
    const user = await this.accountService.find({
      email,
      username
    })

    // compare passwords
    const isPasswordValid = await this.accountService.verifyPassword(
      user.password,
      password
    )

    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password')
    }

    // generate tokens
    const { accessToken, refreshToken } =
      await this.sessionService.generateTokens({
        email: user.email,
        userId: user.id,
        username: user.username
      })

    // create session
    await this.sessionService.create({
      fingerprint,
      userId: user.id,
      accessToken,
      refreshToken
    })

    // cookie initialized in SetRefreshTokenInterceptor interceptor

    return {
      user: omit(user, ['password']),
      accessToken,
      refreshToken
    }
  }

  @Get('signout')
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.signedCookies['refreshToken']

    if (!refreshToken) {
      throw new BadRequestException('Refresh token missing')
    }

    await this.sessionService.delete(refreshToken)

    res.clearCookie('refreshToken')

    return 'User signout successfully'
  }

  @UseInterceptors(SetRefreshTokenInterceptor)
  @Get('refresh')
  async refresh(
    @Headers('fingerprint') fingerprint: string,
    @Req() req: Request
  ) {
    if (!fingerprint) {
      throw new BadRequestException('User fingerprint missing')
    }

    const refreshToken = req.signedCookies['refreshToken'] as string

    if (!refreshToken) {
      throw new BadRequestException('Refresh token missing')
    }

    const { email, userId, username } = await this.sessionService.verifyToken({
      refreshToken
    })

    const { accessToken, refreshToken: newRefreshToken } =
      await this.sessionService.generateTokens({
        email,
        userId,
        username
      })

    //update session
    await this.sessionService.update(refreshToken, {
      fingerprint,
      accessToken,
      refreshToken: newRefreshToken
    })

    return {
      accessToken,
      refreshToken: newRefreshToken
    }
  }
}
