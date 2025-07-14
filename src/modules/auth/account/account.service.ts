import { PrismaService } from '@core/prisma'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as ADLER32 from 'adler-32'
import * as argon from 'argon2'

import { UserPrismaFilter } from './filters'
import { ISignInRequestDto, ISignUpRequestDto } from './types'

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: ISignUpRequestDto) {
    const { email, password, terms } = dto

    if (!terms) {
      throw new BadRequestException('You must agree with term of use')
    }

    const passwordHash = await argon.hash(password)
    const username = this.generateUsername(email)

    return await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        username,
        isActive: true //todo remove later
      },
      select: UserPrismaFilter
    })
  }

  async find(dto: Omit<ISignInRequestDto, 'password'>) {
    const { email, username } = dto

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    return user
  }

  generateUsername(email: string) {
    return `user${ADLER32.str(email)}`
  }

  async verifyPassword(hash: string, passwordCandidate: string) {
    return await argon.verify(hash, passwordCandidate)
  }
}
