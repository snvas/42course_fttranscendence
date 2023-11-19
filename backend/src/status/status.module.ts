import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileModule } from '../profile/profile.module';

@Module({
  controllers: [],
  providers: [StatusService],
  exports: [StatusService],
  imports: [TypeOrmModule.forFeature(entities), ProfileModule],
})
export class StatusModule {}
