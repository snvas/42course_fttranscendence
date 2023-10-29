import { Injectable } from '@nestjs/common';
import { Positions } from './types/positions.type';
import { SocketGameMessage } from './types/socket-game-message.type';

@Injectable()
export class GameService {
    private player1: Positions;
    private player2:Positions;
    private ball: Positions;

    setPlayer1(data: Positions){
        this.player1 = data;
    }

    setPlayer2(data: Positions){
        this.player2 = data;
    }

    setBall(data: Positions){
        this.ball = data;
    }

    allData(): SocketGameMessage {
        const player1 = this.player1;
        const player2 = this.player2;
        const ball = this.ball;
        return {player1, player2, ball}
    }
}
