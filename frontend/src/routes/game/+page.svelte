<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { gameService } from '$lib/api';
	import p5 from 'p5';
	import { onMount } from 'svelte';
	import { match, socket } from '$lib/stores';

	type Positions = {
		positionX: number,
		positionY: number;
	}
	
	let width = 800;
	let height = 600;

	$: widthFull =
		window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	$: console.log(widthFull);

	$: heightFull =
		window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	$: console.log(heightFull);

	const userId = $match?.as == 'p1'? String($match?.p1.id) : String($match?.p2.id);

	gameService.connect();
	gameService.joinPlayerRoom(String($match?.matchId))
	
	console.log($match?.matchId)
	async function sketch(p5: p5) {
		let game: Game;
		let hitSound: p5.SoundFile;
		let ball1: Ball;
		let player1: Player;
		let player2: Player;
		let speedBoost: SpeedBoost;
		//let sizeIncrease : SizeIncrease;

		gameService.getSocket().on('is-ready', (data) => {
			if (data == 1){
				game.start();
			} else if (data == 2) {
				//player disconected
				game.stop();
			}
		})

		p5.setup = async () => {
			p5.createCanvas(width, height);
			game = new Game();
			hitSound = p5.loadSound('PingPongHitBall.mp3'); //
			ball1 = new Ball(game);
			player1 = new Player(1, "player1");
			player2 = new Player(2, "player2");
			game.setBall(ball1);
			p5.textSize(32);
			p5.textAlign(p5.CENTER, p5.CENTER);
			p5.fill(255);
			speedBoost = new SpeedBoost();
			//sizeIncrease = new SizeIncrease(Math.random() < 0.5 ? 1: 2); // Escolha aleatória entre os dois jogadores
		};

		const backgroundColors: { [key: string]: string } = {
			"black": "#030712",
			"red": "#f87171",
			"blue": "#22d3ee",
			"green": "#4ade80",
			"pink": "#f472b6",
			"yellow": "#facc15"
		}

		const backgroundColorSelected: string = localStorage.getItem("backgroundColor") || "black";

		p5.draw = () => {
			gameService.getSocket().on('game-data', (data) => {
				player1.setPositions(data.player1);
				player2.setPositions(data.player2);
				ball1.setPositions(data.ball)
			})
			p5.background(backgroundColors[backgroundColorSelected]);
			p5.rect(width / 2, 0, 5, height);
			player1.drawPlayer();
			player2.drawPlayer();
			
			let scoreText = `${game.pointP1}  |  ${game.pointP2}`;
			p5.text(scoreText, width / 6, 40);
			if (game.winner) {
				let victoryText = `Player ${game.winner} wins!`;
				p5.text(victoryText, width / 2, height / 2);
			}

			if (game.running == true) {
				ball1.draw();
				ball1.move();
				ball1.checkWalls();
				player1.movePlayer();
				player2.movePlayer();
				speedBoost.draw();
				//sizeIncrease.draw();
				ball1.checkColisionPlayer(player1);
				ball1.checkColisionPlayer(player2);

				if (speedBoost.active && ball1.positionX - ball1.diam/2 < speedBoost.positionX + speedBoost.size &&
					ball1.positionX + ball1.diam / 2 > speedBoost.positionX &&
					ball1.positionY - ball1.diam / 2 < speedBoost.positionY + speedBoost.size &&
					ball1.positionY - ball1.diam / 2 > speedBoost.positionY) {
						speedBoost.activateEffect(ball1, player1, player2);
						speedBoost.active = false;
					}
				/*if (sizeIncrease.active){
					let player = sizeIncrease.playerId == 1 ? player1 : player2;
					if (player.positionX < sizeIncrease.positionX + sizeIncrease.size &&
						player.positionX + player.widthP > sizeIncrease.positionX &&
						player.positionY < sizeIncrease.positionY + sizeIncrease.size * 2 &&
						player.positionY + player.heightP > sizeIncrease.positionY) {
							sizeIncrease.activateEffect(ball1, player1, player2);
							sizeIncrease.active = false;
						} 
				}*/
				
			} else {
				if (!game.running && !game.winner) {
					if (p5.keyIsDown(p5.ENTER)) {
						gameService.emitReady({
							matchId: String($match?.matchId),
							userId
						});
					}
				}
			}
		};
		
		
		class Ball {
			public positionX: number;
			public positionY: number;
			public velocityX: number;
			public velocityY: number;
			public diam: number;
			public game: Game;
			public yminor: number;
			public ymajor: number;
			public xref: number;
			public sound: p5.SoundFile;

			constructor(game: Game) {
				this.positionX = width / 2;
				this.positionY = height / 2;
				this.velocityX = p5.random([-5, 13, 33, 50]);
				this.velocityY = p5.random([-5, 13, 33, 50]);
				this.diam = 20;
				this.game = game;
				this.yminor = 0;
				this.ymajor = 0;
				this.xref = 0;
				this.resetVelocity();
				this.sound = hitSound;
			}

			draw() {
				p5.circle(this.positionX, this.positionY, this.diam);
			}

			setPositions(data:Positions){
				this.positionX = data.positionX;
				this.positionY = data.positionY;
			}

			move() {
				this.positionX += this.velocityX;
				this.positionY += this.velocityY;
				let positionX = this.positionX;
				let positionY = this.positionY;
				gameService.emitBall({
					matchId: String($match?.matchId),
					pos:{positionX, positionY},
					userId
				})
			}

			checkWalls() {
				// TODO send sokect here
				if (this.positionX - this.diam / 2 <= 0) {
					//pontuar jogador 2
					this.game.pointing(2);
					this.game.stop();
				}
				if (this.positionX - this.diam / 2 >= width) {
					//pontuarjogador1
					this.game.pointing(1);
					this.game.stop();
				}
				if (this.positionY + this.diam / 2 <= 0) {
					this.velocityY *= -1;
				}
				if (this.positionY + this.diam / 2 >= height) {
					this.velocityY *= -1;
				}
			}

			checkColisionPlayer(player: Player) {
				const ballLeft = this.positionX - this.diam / 2;
				const ballRight = this.positionX + this.diam / 2;
				const ballTop = this.positionY - this.diam / 2;
				const ballBottom = this.positionY + this.diam / 2;

				const playerLeft = player.positionX;
				const playerRight = player.positionX + player.widthP;
				const playerTop = player.positionY;
				const playerBottom = player.positionY + player.heightP;
				let collision = false;

				// Verifique se a bola se sobrepõe ao jogador
				const collides =
					ballLeft < playerRight &&
					ballRight > playerLeft &&
					ballTop < playerBottom &&
					ballBottom > playerTop;

				if (collides) {
					// Ajuste a posição da bola para evitar colisões consecutivas
					if (player.id == 1) {
						this.positionX = playerRight + this.diam / 2;
						this.sound.play();
						collision = true;
					} else {
						this.positionX = playerLeft - this.diam / 2;
						this.sound.play();
						collision = true;
					}

					// Inverta a velocidade da bola no eixo X
					if (collision) {
						// Determine where the ball hit on the player
						const relativeIntersectY = player.positionY + player.heightP / 2 - this.positionY;

						// Normalize the value to -1 - 1
						const normalizedRelativeIntersectionY = relativeIntersectY / (player.heightP / 2);

						// Calculate the new angle
						const bounceAngle = normalizedRelativeIntersectionY * ((3 * Math.PI) / 12);

						this.velocityX = this.velocityX * -1; // Reverse the ball's horizontal direction
						this.velocityY = 5 * -Math.sin(bounceAngle); // Set the ball's vertical velocity based on the bounce angle
					}
				}
			}

			centerBall() {
				this.positionX = width / 2;
				this.positionY = height / 2;
				this.resetVelocity();
			}

			resetVelocity() {
				// Escolha um ângulo aleatório entre 30 e 60 graus (em radianos)
				// Isso garante que a bola não vá diretamente para cima ou para baixo
				const angle = p5.radians(p5.random(30, 60));

				// Decida aleatoriamente se a bola deve ir para a esquerda ou para a direita
				const direction = p5.random() < 0.5 ? -1 : 1;

				// Calcule a velocidade com base no ângulo
				this.velocityX = direction * 5 * p5.cos(angle);255
				this.velocityY = p5.sin(angle) * (p5.random() < 0.5 ? -5 : 5); // Direção aleatória para cima ou para baixo
			}
		}

		const boardColors: { [key: string]: number[] } = {
			"white": [248, 250, 252],
			"red": [239, 68, 68],
			"orange": [249, 115, 22],
			"yellow": [234, 179, 8],
			"blue": [6, 182, 212],
			"violet": [139, 92, 246],
			"pink": [236, 72, 153],
			"green": [34, 197, 94]
		};

		const boardColorSelected = localStorage.getItem("boardColor") || "white";

		class Player {
			private msg;
			public id: number;
			public heightP: number;
			public widthP: number;
			public positionX: number;
			public positionY: number;
			public velocityY: number;

			constructor(typeP: number, player:string) {
				this.msg = player
				this.id = typeP;
				this.heightP = 60;
				this.widthP = 20;
				if (this.id == 1) {
					this.positionX = 0;
				} else {
					this.positionX = width - this.widthP;
				}
				this.positionY = height / 2;
				this.velocityY = 15;
			}

			drawPlayer() {
				p5.fill(boardColors[boardColorSelected][0],
						boardColors[boardColorSelected][1],
						boardColors[boardColorSelected][2]);
				p5.rect(this.positionX, this.positionY, this.widthP, this.heightP);
				p5.fill(255, 255, 255);
			}

			setPositions(data:Positions){
				this.positionX = data.positionX;
				this.positionY = data.positionY;
			}

			movePlayer() {
				if (this.id == 1) {
					if (p5.keyIsDown(87)) {
						if (this.positionY > 0) {
							this.positionY -= this.velocityY;
						} else {
							this.positionY = 0;
						}
					}
					if (p5.keyIsDown(83)) {
						this.positionY += this.velocityY;
						if (this.positionY + this.heightP > height) {
							this.positionY = height - this.heightP;
						}
					}
				} else if (this.id == 2) {
					if (p5.keyIsDown(p5.UP_ARROW)) {
						if (this.positionY > 0) {
							this.positionY -= this.velocityY;
						} else {
							this.positionY = 0;
						}
					}
					if (p5.keyIsDown(p5.DOWN_ARROW)) {
						this.positionY += this.velocityY;
						if (this.positionY + this.heightP > height) {
							this.positionY = height - this.heightP;
						}
					}
				}
				let positionX = this.positionX;
				let positionY = this.positionY;
				gameService.emitPlayer(String(this.msg), {
					matchId: String($match?.matchId),
					pos:{positionX, positionY},
					userId
				})
				/*if (p5.keyIsDown(87) || p5.keyIsDown(83) || p5.keyIsDown(p5.UP_ARROW) || p5.keyIsDown(p5.DOWN_ARROW)){
					socket.emit('player-move', {
						playerId: this.id,
						positionY: this.positionY
					});
				}*/
			}
		}

		class PowerUp {
			public positionX: number;
			public positionY: number;
			public size: number;
			public active: boolean;
			protected duration: number;
			protected cooldown: number;

			constructor() {
				this.size = 60;
				this.active = false;
				this.duration = 10000;
				this.cooldown = 10000;
				setTimeout(() => this.setRandomPosition(), this.duration);
				this.positionX = 0;
				this.positionY = 0;
			}

			setRandomPosition(){
				if (game.pointP1 >= 2 || game.pointP2 >= 2){
					this.positionX = p5.random(50, width - 50);
					this.positionY = p5.random(50, height - 50);
					this.active = true;
					setTimeout(() => {
						this.active = false;
						setTimeout(() => this.setRandomPosition(), this.cooldown);
					}, this.duration);
				} else {
					setTimeout(() => this.setRandomPosition(), 1000);
				}
			}

			draw() {
				if (this.active){
					p5.push();
					p5.fill(255, 0, 0); //Red for SpeedBoost
					p5.rect(this.positionX, this.positionY, this.size, this.size);
					p5.pop();
				}
			}

			activateEffect(ball: Ball, player1: Player, player2: Player) {}
		}

		class SpeedBoost extends PowerUp {
			constructor() {
				super();
			}

			activateEffect(ball: Ball, player1: Player, player2: Player) {
				ball.velocityX *= 2;
				ball.velocityY *= 2;
				setTimeout(() => {
					ball.velocityX /= 2;
					ball.velocityY /= 2;
				}, 5000); //efeito dura 5 segundos
			}

			draw() {
				if (this.active){
					p5.push();
					p5.fill(255, 0, 0); //Red for SpeedBoost
					p5.rect(this.positionX, this.positionY, this.size, this.size);
					p5.pop();
				}
			}
		}

		/*class SizeIncrease extends PowerUp {
			public playerId: number;

			constructor(playerId: number){
				super();
				this.playerId = playerId;
			}

			activateEffect(ball: Ball, player1: Player, player2: Player) {
				let player = this.playerId == 1 ? player1 : player2;
				player.heightP *= 1.5;
				setTimeout(() => {
					player.heightP /= 1.5;
				}, 5000);
			}

			draw() {
				if (this.active){
					p5.push();
					p5.fill(0, 0, 255); //Blue for SizeIncrease
					p5.rect(this.positionX, this.positionY, this.size, this.size * 2);
					p5.pop();
				}
			}
		}*/

		class Game {
			public running: boolean;
			public pointP1: number;
			public pointP2: number;
			public ball: Ball;
			public winner: number;

			constructor() {
				this.running = false;
				this.pointP1 = 0;
				this.pointP2 = 0;
				this.ball = new Ball(this);
				this.winner = 0;
			}

			stop() {
				this.running = false;
			}

			start() {
				this.ball.centerBall();
				this.running = true;
			}

			pointing(p: number) {
				if (p == 1) {
					this.pointP1++;
					if (this.pointP1 == 5) {
						this.gameOver(1);
						return;
					}
				} else if (p == 2) {
					this.pointP2++;
					if (this.pointP2 == 5) {
						this.gameOver(2);
						return;
					}
				}
				p5.print('Pontos p1: ' + this.pointP1 + ' /Pontos p2: ' + this.pointP2);
			}

			gameOver(winner: number) {
				this.running = false; // Para o jogo
				this.winner = winner; // Armazena o ID do jogador vencedor
				setTimeout(() => {
					this.restart();
				}, 2000); // Pausa de 2 segundos antes de reiniciar
			}

			restartPoints() {
				this.pointP1 = this.pointP2 = 0;
			}

			restart() {
				this.running = false;
				this.pointP1 = 0;
				this.pointP2 = 0;
				this.winner = 0;
				this.ball.centerBall();
			}

			setBall(ball: Ball) {
				this.ball = ball;
			}
		}
	}

	let gameNew;

	onMount(async () => {
		/*
		socket.on('game-state', (data) => {
				gameState.set(data);

				ball1.positionX = data.ball.x;
				ball1.positionY = data.ball.y;
				player1.positionY = data.player1.y;
				player2.positionY = data.player2.y;
		});*/

		let element: HTMLElement | null = window.document.getElementById('p5-container');
		if (!element){
			return;
		}
		(<any>window).p5 = p5;
		await import('p5/lib/addons/p5.sound');
		console.log('Loaded Sound');
		gameNew = new p5(sketch, element);
	});

	/*function handlePlayerMove(direction:string){
		socket.emit('player-move', {direction});
	}
	$:gameState;*/

	$socket;

</script>

<div class="h-screen flex flex-col">
	<PongHeader />
	<div class="flex flex-col justify-end items-end">
		<a href="/dashboard"
			><i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" /></a
		>
	</div>
	<div class="flex w-full items-center justify-center grow">
		<div class="w-fit flex items-center justify-center p-5 bg-slate-500 rounded-lg">
			<div id="p5-container" />
		</div>
	</div>
</div>
