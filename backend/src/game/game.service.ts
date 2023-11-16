import { Injectable } from '@nestjs/common';
import { Positions } from './types/positions.type';
import { SocketGameMessage } from './types/socket-game-message.type';
import { MatchGameService } from 'src/match/services/match-game.service';
import { GameDataDto } from './dto/game.data.dto';
import { ConsultDataDto } from './dto/consult.data.dto';
import { Player } from './types/player.type';

@Injectable()
export class GameService {
    private player1: Map<string, Player>;
    private player2: Map<string, Player>;
    private ball: Map<string, Positions>;
    private isReady: Map<string, Array<string>>;

    constructor(private readonly matchGameService:MatchGameService){
        this.player1 = new Map();
        this.player2 = new Map();
        this.ball = new Map();
        this.isReady = new Map([]);
    }
    //TODO make a DTO with this type
    setPlayer1(p:GameDataDto, soketId:string){
        this.player1.set(p.matchId, {pos:p.pos, id: p.userId, soketId});
    }

    setPlayer2(p:GameDataDto, soketId:string){
        this.player2.set(p.matchId, {pos:p.pos, id: p.userId, soketId});
    }

    setBall(p:GameDataDto){
        this.ball.set(p.matchId, {positionX: p.pos.positionX, positionY: p.pos.positionY});
    }

    ballValidation(data:ConsultDataDto, socketId:string) {
        const arr = this.isReady.get(data.matchId);
        const value = arr ? arr[0]: "";
        if (socketId == value) {
            return true;
        }
        return false;
    }

    setReady(data:ConsultDataDto, socketId:string){
        if (!this.isReady.get(data.matchId)) {
            this.isReady.set(data.matchId, new Array(socketId))
        }
        else {
            const arr = this.isReady.get(data.matchId);
            if (arr?.indexOf(socketId) != -1) {
                arr?.push(socketId);
            }
        }
    }

    reConnect(matchId:string, socketId:string) {
        if(socketId == this.player1.get(matchId)?.soketId
        || socketId == this.player2.get(matchId)?.soketId) {
            console.log("socket of reconnect is the same of connect")
            this.isReady.get(matchId)?.push(socketId)
        }
    }

    //get room name on consultDataDto
    playerDisconected(matchId:string, socketId:string) {
        let arr =  this.isReady.get(matchId);
        if (arr?.indexOf(socketId) == 0) {
            arr?.reverse();
        }
        setTimeout(() => {
            const value = arr ? arr[1]: "";
            if (arr?.length != 2) {
                if (value == this.player1.get(matchId)?.soketId){
                    this.matchGameService.abandonMatch(matchId,'p1')
                }
                else {
                    this.matchGameService.abandonMatch(matchId, 'p2')
                }
            }
        }, 60000); // 60 seconds
        this.isReady.get(matchId)?.pop();
        return 2;
    }

    //finish room and delete Map
    isPlayersReady(matchId:string){
        if (this.isReady.get(matchId)?.length == 2){
            return 1;
        }
        return 0;
    }

    allData(matchId:string): SocketGameMessage {
        let obj = this.player1.get(matchId);
        const player1 = obj ? obj.pos : {positionX:0, positionY:0};
        obj = this.player2.get(matchId);
        const player2 = obj ? obj.pos : {positionX:0, positionY:0};
        let pos = this.ball.get(matchId);
        const ball = pos ? pos : {positionX:0, positionY:0};
        return {player1: player1, player2: player2, ball}
    }
}
