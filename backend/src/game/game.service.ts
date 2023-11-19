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
/**
 * Represents a game service that manages game logic and data for matches.
 */
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
  /**
   * Updates the games by iterating through the matches and performing game logic.
   * If a match has two players, it updates the ball position, checks for collisions with players and walls,
   * and handles scoring and victory conditions.
   */
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
                this.finishMatch(matchId);
                console.log('finished');
              }
            });
          ball = resetBall(now);
        }

        this.ball.set(matchId, ball);
        this.lastUpdate.set(matchId, now);
        this.emit(matchId, 'ball-movement', ball);
      }
    });
  }

  /**
   * Finish a match.
   * @param matchId - The ID of the match to finish.
   */
  async finishMatch(matchId: string) {
    try {
      const updatedMatch = await this.matchGameService.finishMatch(matchId);
      this.emit(matchId, 'finished', { winner: updatedMatch.winner });
    } catch (error) {
      console.log('Erron on finished match: ', error);
    }
  }

  ///REVIEW
  async abandonMatch(matchId: string, by: 'p1' | 'p2') {
    const updatedMatch = await this.matchGameService.abandonMatch(matchId, by);
    console.log('abandoned');
    this.emit(matchId, 'abandoned', { winner: updatedMatch.winner });
  }

  /**
   * Checks if a player has reached the victory condition in a match.
   * @param matchId - The ID of the match.
   * @param scores - The scores of the players.
   * @returns True if a player has reached the victory condition, false otherwise.
   */
  checkVictory(
    matchId: string,
    scores: { p1Score: number; p2Score: number },
  ): boolean {
    return scores.p1Score == 3 || scores.p2Score == 3;
  }

  /**
   * Sets the callback function to be called when a specific event occurs.
   *
   * @param fn - The callback function to be set.
   *              It takes three parameters: `to` (string), `ev` (string), and `data` (any).
   *              The `to` parameter represents the recipient of the event.
   *              The `ev` parameter represents the event name.
   *              The `data` parameter represents the data associated with the event.
   */
  setCallback(fn: (to: string, ev: string, data: any) => void) {
    this.callback = fn;
  }

  /**
   * Emits an event to a specific recipient.
   * @param to - The recipient of the event.
   * @param ev - The name of the event.
   * @param data - The data associated with the event.
   */
  emit(to: string, ev: string, data: any) {
    if (this.callback) {
      this.callback(to, ev, data);
    }
  }

  /**
   * Sets the player 1 data for a game match.
   * @param p The game data DTO containing the match ID, position, and user ID.
   * @param soketId The socket ID of the player.
   */
  setPlayer1(p: GameDataDto, soketId: string) {
    if (this.player2.get(p.matchId)?.soketId != soketId) {
      this.player1.set(p.matchId, { pos: p.pos, id: p.userId, soketId });
    }
  }

  /**
   * Sets the player 2 data for a game.
   *
   * @param p - The game data DTO containing the match ID, position, and user ID.
   * @param soketId - The socket ID of the player.
   */
  setPlayer2(p: GameDataDto, soketId: string) {
    if (this.player1.get(p.matchId)?.soketId != soketId) {
      this.player2.set(p.matchId, { pos: p.pos, id: p.userId, soketId });
    }
  }

  /**
   * Sets the readiness status for a player in a match.
   * If the match ID does not exist in the readiness map, a new entry is created with the player's socket ID.
   * If the match ID already exists, the player's socket ID is added to the existing entry if it does not already exist.
   *
   * @param data - The ConsultDataDto object containing the match ID.
   * @param socketId - The socket ID of the player.
   */
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

  /**
   * Handles the reconnection of a player to a match.
   * @param matchId - The ID of the match.
   * @param socketId - The ID of the reconnected player's socket.
   */
  reConnect(matchId: string, socketId: string) {
    if (
      socketId == this.player1.get(matchId)?.soketId ||
      socketId == this.player2.get(matchId)?.soketId
    ) {
      console.log('socket of reconnect is the same of connect');
      this.isReady.get(matchId)?.push(socketId);
    }
  }

  /**
   * Handles the disconnection of a player from a match.
   * @param matchId - The ID of the match.
   * @param socketId - The ID of the disconnected player's socket.
   * @returns The number 2.
   */
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

  /**
   * Checks if both players are ready in a match.
   * @param matchId - The ID of the match.
   * @returns 1 if both players are ready, 0 otherwise.
   */
  isPlayersReady(matchId: string) {
    if (this.isReady.get(matchId)?.length == 2) {
      return 1;
    }
    return 0;
  }

  /**
   * Retrieves the ball object for a given match.
   * @param matchId The ID of the match.
   * @returns The ball object containing its position.
   */
  getBall(matchId: string) {
    const pos = this.ball.get(matchId);
    const ball = pos ? pos : { positionX: 0, positionY: 0 };
    return { ball };
  }

  /**
   * Retrieves all data related to a specific match.
   * @param matchId - The ID of the match.
   * @returns A SocketGameMessage object containing the positions of player1, player2, and the ball.
   */
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

/**
 * Converts degrees to radians.
 * @param n The number in degrees.
 * @returns The number in radians.
 */
function radians(n: number) {
  return n * (Math.PI / 180);
}

/**
 * Generates a random number between the specified minimum and maximum values.
 * @param min The minimum value. Default is 0.
 * @param max The maximum value. Default is 1.
 * @returns A random number between the minimum and maximum values.
 */
function random(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

const vel = 200;

/**
 * @brief Resets the ball to the center of the screen and gives it a random velocity.
 *
 * @param now The current time in milliseconds.
 * @returns A ball object with random velocity and position.
 */
function resetBall(now: number): Ball {
  const ball = {
    diam,
    positionX: width / 2,
    positionY: height / 2,
    velocityX: 0,
    velocityY: 0,
    lastUpdate: now,
  };

  // Choose a random angle for the ball to move in radians
  // This is between 30 and 60 degrees, to assure the ball doesn't move in a too horizontal or vertical direction
  const angle = radians(random(30, 60));

  // Decide in which direction the ball will go
  const directionX = random() < 0.5 ? -1 : 1;
  const directionY = random() < 0.5 ? -1 : 1;

  // Calculate the velocity in each direction using trigonometry
  ball.velocityX = directionX * vel * Math.cos(angle);
  ball.velocityY = directionY * vel * Math.sin(angle); // DirectionY é invertido porque o eixo Y é invertido
  return ball;
}

/**
 * Checks if the ball has collided with any walls or paddles.
 * @param ball - The ball object to check.
 * @returns The identifier of the player ('p1' or 'p2') if the ball collided with a paddle, or null if it collided with a wall.
 */
function checkWalls(ball: Ball): 'p1' | 'p2' | null {
  if (ball.positionX - ball.diam / 2 <= 0) {
    return 'p2';
  }
  if (ball.positionX - ball.diam / 2 >= width) {
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

/**
 * @brief Checks if a collision occurred between a ball and a player.
 *
 * @param ball The ball object with properties positionX, positionY, and diam.
 * @param player The player object with properties pos (which is an object with properties positionX and positionY), widthP, and heightP.
 *
 * If a collision is detected, the function adjusts the ball's position to avoid consecutive collisions and reverses the ball's direction. It also calculates a new angle for the ball's trajectory based on where the ball hit the player.
 */
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
