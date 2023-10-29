import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FortyTwoUser } from '../auth';
import { ProfileDTO } from './models/profile.dto';
import { ProfileUpdatedResponseDto } from './models/profile-updated-response.dto';
import { ProfileDeletedResponseDto } from './models/profile-delete-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarDTO } from '../avatar/models/avatar.dto';
import { Readable } from 'stream';
import { AvatarService } from '../avatar/avatar.service';
import { Response } from 'express';
import { AvatarEntity } from '../db/entities';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { ProfileNicknameDto } from './models/profile-nickname.dto';
import { FriendService } from './services/friend.service';
import { ProfileFriendDto } from './models/profile-friend.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly avatarService: AvatarService,
    private readonly friendService: FriendService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async getUserProfile(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<ProfileDTO> {
    return await this.profileService.findByUserId(user.id);
  }

  @Get('public/:id')
  @HttpCode(HttpStatus.OK)
  async getPublicProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProfileDTO> {
    return await this.profileService.findByProfileId(id);
  }

  @Get('profiles')
  @HttpCode(HttpStatus.OK)
  async getAllProfiles(): Promise<ProfileDTO[]> {
    return await this.profileService.findAllProfiles();
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async saveProfile(
    @Req() { user }: { user: FortyTwoUserDto },
    @Body() body: ProfileNicknameDto,
  ): Promise<ProfileDTO> {
    return await this.profileService.create(user.id, body.nickname);
  }

  @Put()
  @HttpCode(HttpStatus.CREATED)
  async updateProfile(
    @Req() { user }: { user: FortyTwoUserDto },
    @Body() profile: Partial<ProfileDTO>,
  ): Promise<ProfileUpdatedResponseDto> {
    return await this.profileService.update(user.id, profile);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteProfile(
    @Req() { user }: { user: FortyTwoUser },
  ): Promise<ProfileDeletedResponseDto> {
    return await this.profileService.delete(user.id);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Req() @Req() { user }: { user: FortyTwoUserDto },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: '(png|jpeg|jpg)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<AvatarDTO> {
    return this.profileService.uploadAvatar(
      user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Get('avatar/:id')
  async getAvatarById(
    @Res({ passthrough: true }) response: Response,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const avatar: AvatarEntity = await this.avatarService.getById(id);

    const stream: Readable = Readable.from(avatar.data);

    response.set({
      'Content-Disposition': `inline; filename="${avatar.filename}"`,
      'Content-Type': 'image',
    });

    return new StreamableFile(stream);
  }

  @Get('friends')
  async getFriends(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<ProfileFriendDto[]> {
    return await this.friendService.getFriends(user.id);
  }

  @Post('friend/:profileId')
  async addFriend(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<ProfileDTO> {
    return await this.friendService.addFriend(user.id, profileId);
  }
}
