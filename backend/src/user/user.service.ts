import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../db/entities';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    this.logger.verbose(
      `### Creating user [${user.id}] - ${JSON.stringify(user)}`,
    );
    return this.userRepository.create(user);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    this.logger.verbose(
      `### Creating user [${user.id}] - ${JSON.stringify(user)}`,
    );
    return await this.userRepository.save(user);
  }

  async update(user: UserEntity): Promise<void> {
    this.logger.verbose(
      `### Updating user [${user.id}] - ${JSON.stringify(user)}`,
    );
    await this.userRepository.update(user.id, user);
  }

  async delete(id: number): Promise<DeleteResult> {
    this.logger.verbose(`### Deleting user [${id}]`);
    return await this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    this.logger.verbose(`### Finding user by email: ${email}`);
    return await this.userRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<UserEntity | null> {
    this.logger.verbose(`### Finding user [${id}] by id`);
    return await this.userRepository.findOneBy({ id });
  }

  async enable2FA(id: number): Promise<void> {
    this.logger.verbose(`### Enabling user [${id}] OTP`);
    await this.userRepository.update(id, {
      otpEnabled: true,
      otpValidated: true,
    });
  }

  async disable2FA(id: number): Promise<void> {
    this.logger.verbose(`### Enabling user [${id}] OTP`);
    await this.userRepository.update(id, {
      otpEnabled: false,
      otpValidated: false,
    });
  }

  async add2FASecret(id: number, secret: string): Promise<void> {
    this.logger.verbose(`### Adding OTP secret to user [${id}]`);
    await this.userRepository.update(id, {
      otpSecret: secret,
    });
  }

  async validateOTP(id: number): Promise<void> {
    this.logger.verbose(`### Validating user [${id}] OTP`);
    await this.userRepository.update(id, {
      otpValidated: true,
    });
  }

  async invalidateOTP(id: number): Promise<void> {
    this.logger.verbose(`### Invalidating user [${id}] OTP`);
    await this.userRepository.update(id, {
      otpValidated: false,
    });
  }
}
