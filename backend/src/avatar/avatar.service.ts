import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, QueryRunner, Repository } from 'typeorm';
import { AvatarEntity } from '../db/entities';
import { AvatarDTO } from './models/avatar.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AvatarService {
  private readonly logger: Logger = new Logger(AvatarService.name);

  constructor(
    @InjectRepository(AvatarEntity)
    private readonly avatarRepository: Repository<AvatarEntity>,
  ) {}

  async getById(id: number): Promise<AvatarEntity> {
    this.logger.verbose(`### Getting avatar [${id}]`);

    const avatar: AvatarEntity | null = await this.avatarRepository.findOneBy({
      id,
    });
    if (!avatar) {
      throw new NotFoundException();
    }
    return avatar;
  }

  async delete(id: number): Promise<DeleteResult> {
    this.logger.verbose(`### Deleting avatar [${id}]`);

    return await this.avatarRepository.delete({
      id,
    });
  }

  async uploadWithQueryRunner(
    dataBuffer: Buffer,
    filename: string,
    queryRunner: QueryRunner,
  ): Promise<AvatarDTO> {
    const newAvatar: AvatarEntity = queryRunner.manager.create(AvatarEntity, {
      filename,
      data: dataBuffer,
    });

    const savedAvatar: AvatarEntity = await queryRunner.manager.save(
      AvatarEntity,
      newAvatar,
    );

    this.logger.verbose(`### Avatar [${newAvatar.id}] uploaded`);

    return plainToClass(AvatarDTO, savedAvatar);
  }

  async deleteWithQueryRunner(
    fileId: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const deleteResult: DeleteResult = await queryRunner.manager.delete(
      AvatarEntity,
      {
        id: fileId,
      },
    );

    if (!deleteResult.affected) {
      throw new NotFoundException();
    }

    this.logger.verbose(`### Avatar [${fileId}] deleted`);
  }
}
