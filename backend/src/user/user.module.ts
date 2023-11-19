import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';

@Module({
  controllers: [],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [UserService],
})
export class UserModule {}
