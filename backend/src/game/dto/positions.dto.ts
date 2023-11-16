import { IsNotEmpty, IsNumber } from 'class-validator';

export class PositionsDto {
    @IsNotEmpty()
    @IsNumber()
    positionX: number
    
    @IsNotEmpty()
    @IsNumber()
    positionY: number
}
