<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import p5 from 'p5';
	import { onMount } from 'svelte';
	//import type { Sketch } from 'p5';
	//import loadSound from 'p5/lib/addons/p5.sound';

	let width = 800;
	let height = 600;

	$: widthFull =
		window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	$: console.log(widthFull);

	$: heightFull =
		window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	$: console.log(heightFull);

	function sketch(p5: p5) {
		let game: Game;
		let ball1: Ball;
		let player1: Player;
		let player2: Player;

		p5.setup = () => {
			p5.createCanvas(width, height);
			game = new Game();
			ball1 = new Ball(game);
			player1 = new Player(1);
			player2 = new Player(2);
			game.setBall(ball1);
			p5.textSize(32);
			p5.textAlign(p5.CENTER, p5.CENTER);
			p5.fill(255);
		};

		p5.draw = () => {
			p5.background(0);
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
				ball1.checkColisionPlayer(player1);
				ball1.checkColisionPlayer(player2);
			} else {
				if (!game.running && !game.winner) {
					if (p5.keyIsDown(p5.ENTER)) {
						game.start();
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
			public sound: any;

			constructor(game: Game) {
				this.positionX = width / 2;
				this.positionY = height / 2;
				this.velocityX = p5.random([-5, -3, 3, 5]);
				this.velocityY = p5.random([-5, -3, 3, 5]);
				this.diam = 20;
				this.game = game;
				this.yminor = 0;
				this.ymajor = 0;
				this.xref = 0;
				this.resetVelocity();
				//this.sound = new p5.SoundFile("/PingPongBallHit.mp3");
			}

			draw() {
				p5.circle(this.positionX, this.positionY, this.diam);
			}

			move() {
				this.positionX += this.velocityX;
				this.positionY += this.velocityY;
			}
			checkWalls() {
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
						collision = true;
					} else {
						this.positionX = playerLeft - this.diam / 2;
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
				this.velocityX = direction * 5 * p5.cos(angle);
				this.velocityY = p5.sin(angle) * (p5.random() < 0.5 ? -5 : 5); // Direção aleatória para cima ou para baixo
			}
		}

		class Player {
			public id: number;
			public heightP: number;
			public widthP: number;
			public positionX: number;
			public positionY: number;
			public velocityY: number;

			constructor(typeP: number) {
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
				p5.rect(this.positionX, this.positionY, this.widthP, this.heightP);
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
			}
		}

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

	onMount(() => {
		let element: HTMLElement = window.document.getElementById('p5-container');
		gameNew = new p5(sketch, element);
		element.style.backgroundColor = 'white';
	});
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
