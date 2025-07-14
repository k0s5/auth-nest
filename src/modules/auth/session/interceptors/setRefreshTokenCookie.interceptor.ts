import { EnvironmentVariables } from '@config/env.validation'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { addTimeToDate, omit } from '@/shared/utils'
import { IS_DEV } from '@/shared/utils/is-dev.util'

@Injectable()
export class SetRefreshTokenInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>()

    const expiresIn = addTimeToDate(
      this.configService.getOrThrow<string>('REFRESH_TOKEN_LIFETIME')
    )

    return next.handle().pipe(
      tap((data: { refreshToken?: string }) => {
        console.info('refreshToken:', data.refreshToken)

        if (data.refreshToken) {
          res.cookie('refreshToken', data.refreshToken, {
            signed: true,
            httpOnly: true,
            sameSite: true,
            secure: IS_DEV ? false : true,
            maxAge: expiresIn.getTime()
          })
        }
      }),
      map((data: { refreshToken?: string }) => {
        // Remove refreshToken from response body
        return omit(data, ['refreshToken'])
      })
    )
  }
}
