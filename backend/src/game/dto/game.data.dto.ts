import {
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PositionsDto } from './positions.dto';

export class GameDataDto {
  @IsNotEmpty()
  @IsString()
  matchId: string;

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested({ each: true })
  @Type(() => PositionsDto)
  pos: PositionsDto;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
