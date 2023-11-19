import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import AvatarModule from '../avatar/avatar.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [TypeOrmModule.forFeature(entities), AvatarModule, UserModule],
  exports: [ProfileService],
})
export class ProfileModule {}
