import { Injectable } from '@nestjs/common';
import { Positions } from './types/positions.type';
import { SocketGameMessage } from './types/socket-game-message.type';

@Injectable()
export class GameService {
    private player1: Positions;
    private player2:Positions;
    private ball: Positions;
    private isReady: Array<string>;
    constructor(){
        this.isReady = [];
    }

    setPlayer1(data: Positions){
        this.player1 = data;
    }

    setPlayer2(data: Positions){
        this.player2 = data;
    }

    setBall(data: Positions){
        this.ball = data;
    }

    ballValidation(user: string) {
        if (user == this.isReady[0]) {
            console.log("ball validated")
            return true;
        }
        return false;
    }

    setReady(user: string){
        if (this.isReady.length) {
            if (this.isReady.indexOf(user) == -1) {
                this.isReady.push(user);
            }
        }
        else {
            this.isReady.push(user);
        }
    }

    isPlayersReady(){
        console.log(this.isReady.length == 2)
        if (this.isReady.length == 2){
            return true;
        }
        return false;
    }

    allData(): SocketGameMessage {
        const player1 = this.player1;
        const player2 = this.player2;
        const ball = this.ball;
        return {player1, player2, ball}
    }
}
