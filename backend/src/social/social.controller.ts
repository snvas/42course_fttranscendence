import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { Oauth2UserDto } from '../user/models/oauth2-user.dto';
import { SimpleProfileDto } from '../profile/models/simple-profile.dto';
import { ProfileDeletedResponseDto } from '../profile/models/profile-delete-response.dto';
import { BlockService } from './services/block.service';
import { FriendService } from './services/friend.service';

@Controller('social')
export class SocialController {
  constructor(
    private readonly blockService: BlockService,
    private readonly friendService: FriendService,
  ) {}

  @Post('friend/:profileId')
  async addFriend(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<SimpleProfileDto> {
    return await this.friendService.addFriend(user.id, profileId);
  }

  @Get('friends')
  async getFriends(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<SimpleProfileDto[]> {
    return await this.friendService.getFriends(user.id);
  }

  @Get('friends/public/:profileId')
  async getPublicFriends(
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<SimpleProfileDto[]> {
    return await this.friendService.getPublicFriends(profileId);
  }

  @Get('friend-by')
  async getFriendBy(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<SimpleProfileDto[]> {
    return await this.friendService.getFriendBy(user.id);
  }

  @Delete('friend/:profileId')
  async deleteFriend(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<ProfileDeletedResponseDto> {
    return await this.friendService.deleteFriend(user.id, profileId);
  }

  @Post('block/:profileId')
  async addBlock(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<SimpleProfileDto> {
    return await this.blockService.addBlock(user.id, profileId);
  }

  @Get('blocks')
  async getBlocks(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<SimpleProfileDto[]> {
    return await this.blockService.getBlocks(user.id);
  }

  @Get('blocked-by')
  async getBlockedBy(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<SimpleProfileDto[]> {
    return await this.blockService.getBlockedBy(user.id);
  }

  @Delete('block/:profileId')
  async deleteBlock(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<ProfileDeletedResponseDto> {
    return await this.blockService.deleteBlock(user.id, profileId);
  }
}
