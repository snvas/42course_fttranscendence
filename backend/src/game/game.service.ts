import { Injectable } from '@nestjs/common';
import { SocketGameMessage } from './types/socket-game-message.type';
import { MatchGameService } from 'src/match/services/match-game.service';
import { GameDataDto } from './dto/game.data.dto';
import { ConsultDataDto } from './dto/consult.data.dto';
import { Player } from './types/player.type';
import { Interval } from '@nestjs/schedule';

type Ball = {
  positionX: number;
  positionY: number;
  velocityX: number;
  velocityY: number;
  diam: number;
  lastUpdate: number;
};

const width = 800;
const height = 600;
const widthP = 20;
const heightP = 60;
const diam = 20;

@Injectable()
export class GameService {
  private player1: Map<string, Player>;
  private player2: Map<string, Player>;

  private ball: Map<string, Ball>;
  private isReady: Map<string, Array<string>>;
  private lastUpdate: Map<string, number>;

  private callback: (to: string, ev: string, data: any) => void;

  constructor(private matchGameService: MatchGameService) {
    this.player1 = new Map();
    this.player2 = new Map();
    this.ball = new Map();
    this.isReady = new Map();
    this.lastUpdate = new Map();
    this.callback = () => {};
  }

  @Interval(25)
  updateGames() {
    this.isReady.forEach((value, matchId) => {
      if (value.length == 2) {
        const now = Date.now();
        const lastUpdate = this.lastUpdate.get(matchId) ?? now;
        const delta = (now - lastUpdate) / 1000;

        let ball = this.ball.get(matchId) ?? resetBall(now);
        const player1 = this.player1.get(matchId);
        const player2 = this.player2.get(matchId);
        if (!player1 || !player2) throw new Error('error');

        ball.positionX += ball.velocityX * delta;
        ball.positionY += ball.velocityY * delta;
        checkColisionPlayer(ball, player1);
        checkColisionPlayer(ball, player2);
        const playerThatScored = checkWalls(ball);

        if (playerThatScored) {
          this.matchGameService
            .savePoints(matchId, playerThatScored)
            .then((res) => {
              this.emit(matchId, 'scoreboard', {
                p1Score: res.p1Score,
                p2Score: res.p2Score,
              });
              console.log('scoreboard');
              if (this.checkVictory(matchId, res)) {
                this.emit(matchId, 'finished', { winner: playerThatScored });
                this.matchGameService.finishMatch(matchId);
                console.log('finished');
              }
            });
          ball = resetBall(now);
        }

        this.ball.set(matchId, ball);
        this.lastUpdate.set(matchId, now);
        this.emit(matchId, 'ball-movement', ball);
        //console.log('ball-movement');
      }
    });
  }

  checkVictory(
    matchId: string,
    scores: { p1Score: number; p2Score: number },
  ): boolean {
    return scores.p1Score == 5 || scores.p2Score == 5;
  }

  setCallback(fn: (to: string, ev: string, data: any) => void) {
    this.callback = fn;
  }

  emit(to: string, ev: string, data: any) {
    if (this.callback) {
      this.callback(to, ev, data);
    }
  }

  setPlayer1(p: GameDataDto, soketId: string) {
    if (this.player2.get(p.matchId)?.soketId != soketId) {
      this.player1.set(p.matchId, { pos: p.pos, id: p.userId, soketId });
    }
  }

  setPlayer2(p: GameDataDto, soketId: string) {
    if (this.player1.get(p.matchId)?.soketId != soketId) {
      this.player2.set(p.matchId, { pos: p.pos, id: p.userId, soketId });
    }
  }

  setReady(data: ConsultDataDto, socketId: string) {
    if (!this.isReady.get(data.matchId)) {
      this.isReady.set(data.matchId, new Array(socketId));
    } else {
      const arr = this.isReady.get(data.matchId);
      if (arr?.indexOf(socketId) == -1) {
        arr?.push(socketId);
      }
    }
  }

  reConnect(matchId: string, socketId: string) {
    if (
      socketId == this.player1.get(matchId)?.soketId ||
      socketId == this.player2.get(matchId)?.soketId
    ) {
      console.log('socket of reconnect is the same of connect');
      this.isReady.get(matchId)?.push(socketId);
    }
  }
  //get room name on consultDataDto
  playerDisconected(matchId: string, socketId: string) {
    const arr = this.isReady.get(matchId);
    if (arr?.indexOf(socketId) == 0) {
      arr?.reverse();
    }
    setTimeout(() => {
      const value = arr ? arr[1] : '';
      if (arr?.length != 2) {
        if (value == this.player1.get(matchId)?.soketId) {
          this.matchGameService.abandonMatch(matchId, 'p1');
        } else {
          this.matchGameService.abandonMatch(matchId, 'p2');
        }
      }
    }, 60000); // 60 seconds
    this.isReady.get(matchId)?.pop();
    return 2;
  }

  //finish room and delete Map
  isPlayersReady(matchId: string) {
    if (this.isReady.get(matchId)?.length == 2) {
      return 1;
    }
    return 0;
  }

  getBall(matchId: string) {
    const pos = this.ball.get(matchId);
    const ball = pos ? pos : { positionX: 0, positionY: 0 };
    return { ball };
  }

  allData(matchId: string): SocketGameMessage {
    let obj = this.player1.get(matchId);
    const player1 = obj ? obj.pos : { positionX: 0, positionY: 0 };
    obj = this.player2.get(matchId);
    const player2 = obj ? obj.pos : { positionX: 0, positionY: 0 };
    const pos = this.ball.get(matchId);
    const ball = pos ? pos : { positionX: 0, positionY: 0 };
    return { player1, player2, ball };
  }
}

function radians(n: number) {
  return n * (Math.PI / 180);
}

function random(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

const vel = 200;

function resetBall(now: number): Ball {
  const ball = {
    diam,
    positionX: width / 2,
    positionY: height / 2,
    velocityX: 0,
    velocityY: 0,
    lastUpdate: now,
  };

  // Escolha um ângulo aleatório entre 30 e 60 graus (em radianos)
  // Isso garante que a bola não vá diretamente para cima ou para baixo
  const angle = radians(random(30, 60));

  // Decida aleatoriamente se a bola deve ir para a esquerda ou para a direita
  const directionX = random() < 0.5 ? -1 : 1;
  const directionY = random() < 0.5 ? -1 : 1;

  // Calcule a velocidade com base no ângulo
  ball.velocityX = directionX * vel * Math.cos(angle);
  ball.velocityY = directionY * vel * Math.sin(angle); // Direção aleatória para cima ou para baixo
  return ball;
}

function checkWalls(ball: Ball): 'p1' | 'p2' | null {
  if (ball.positionX - ball.diam / 2 <= 0) {
    // console.log('front p2 point');
    return 'p2';
  }
  if (ball.positionX - ball.diam / 2 >= width) {
    //console.log('front p1 point');
    return 'p1';
  }
  if (ball.positionY + ball.diam / 2 <= 0) {
    ball.velocityY *= -1;
  }
  if (ball.positionY + ball.diam / 2 >= height) {
    ball.velocityY *= -1;
  }
  return null;
}

function checkColisionPlayer(ball: Ball, player: Player) {
  const ballLeft = ball.positionX - ball.diam / 2;
  const ballRight = ball.positionX + ball.diam / 2;
  const ballTop = ball.positionY - ball.diam / 2;
  const ballBottom = ball.positionY + ball.diam / 2;

  const playerLeft = player.pos.positionX;
  const playerRight = player.pos.positionX + widthP;
  const playerTop = player.pos.positionY;
  const playerBottom = player.pos.positionY + heightP;
  let collision = false;

  // Verifique se a bola se sobrepõe ao jogador
  const collides =
    ballLeft < playerRight &&
    ballRight > playerLeft &&
    ballTop < playerBottom &&
    ballBottom > playerTop;

  if (collides) {
    // Ajuste a posição da bola para evitar colisões consecutivas
    if (ball.positionX > player.pos.positionX) {
      ball.positionX = playerRight + ball.diam / 2;
      collision = true;
    } else {
      ball.positionX = playerLeft - ball.diam / 2;
      collision = true;
    }

    // Inverta a velocidade da bola no eixo X
    if (collision) {
      // Determine where the ball hit on the player
      const relativeIntersectY =
        player.pos.positionY + heightP / 2 - ball.positionY;

      // Normalize the value to -1 - 1
      const normalizedRelativeIntersectionY =
        relativeIntersectY / (heightP / 2);

      // Calculate the new angle
      const bounceAngle =
        normalizedRelativeIntersectionY * ((3 * Math.PI) / 12);

      ball.velocityX = ball.velocityX * -1; // Reverse the ball's horizontal direction
      ball.velocityY = vel * -Math.sin(bounceAngle); // Set the ball's vertical velocity based on the bounce angle
    }
  }
}
