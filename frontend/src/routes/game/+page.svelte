<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { gameService } from '$lib/api';
	import p5 from 'p5';
	import { onDestroy, onMount } from 'svelte';
	import { match } from '$lib/stores';
	import { goto } from '$app/navigation';

	type Positions = {
		positionX: number;
		positionY: number;
	};

	type Movement = {
		positionX: number;
		positionY: number;
		velocityX: number;
		velocityY: number;
	};

	let width = 800;
	let height = 600;

	$: widthFull =
		window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	$: console.log(widthFull);

	$: heightFull =
		window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	$: console.log(heightFull);

	const userId = $match?.as == 'p1' ? String($match?.p1.id) : String($match?.p2.id);

	console.log($match?.matchId);

	async function sketch(p5: p5) {
		let game: Game;
		let ball1: Ball;
		let player1: Player;
		let player2: Player;
		let hitSound: p5.SoundFile;
		let lastUpdate: number = Date.now();

		gameService.getSocket().on('is-ready', (data) => {
			if (data == 1) {
				game.start();
			} else if (data == 2 || data == 0) {
				//player disconected
				game.stop();
			}
		});

		gameService.getSocket().on('scoreboard', (data) => {
			game.pointP1 = data.p1Score;
			game.pointP2 = data.p2Score;
		});

		gameService.getSocket().on('finished', (data) => {
			game.gameOver(data.winner);

			goto('/dashboard');
		});

		gameService.getSocket().on('game-data', (data) => {
			if (!($match?.as == 'p1')) {
				player1.setPositions(data.player1);
			} else {
				player2.setPositions(data.player2);
			}
		});

		// the ball in new rote
		gameService.getSocket().on('ball-movement', (data) => {
			ball1.setMovement(data);
			lastUpdate = data.lastUpdate;
		});

		p5.setup = async () => {
			p5.createCanvas(width, height);
			game = new Game();
			hitSound = p5.loadSound('PingPongHitBall.mp3'); //
			ball1 = new Ball(game);
			player1 = new Player();
			player2 = new Player();
			game.setBall(ball1);
			p5.textSize(32);
			p5.textAlign(p5.CENTER, p5.CENTER);
			p5.fill(255);
		};

		const backgroundColors: { [key: string]: string } = {
			black: '#030712',
			red: '#f87171',
			blue: '#22d3ee',
			green: '#4ade80',
			pink: '#f472b6',
			yellow: '#facc15'
		};

		const backgroundColorSelected: string = localStorage.getItem('backgroundColor') || 'black';

		p5.draw = () => {
			const now = Date.now();
			const delta = (now - lastUpdate) / 1000;
			lastUpdate = now;

			p5.background(backgroundColors[backgroundColorSelected]);
			p5.rect(width / 2, 0, 5, height);

			player1.drawPlayer();
			player2.drawPlayer();

			let scoreText = `${game.pointP1}  |  ${game.pointP2}`;

			p5.text(scoreText, width / 6, 40);

			if (game.running == true) {
				ball1.draw();

				if ($match?.as == 'p1') {
					player1.movePlayer();
				} else {
					player2.movePlayer();
				}

				if (game.winner) {
					let victoryText = `Player ${game.winner} wins!`;
					p5.text(victoryText, width / 2, height / 2);
				}
			} else if (!game.winner) {
				if (p5.keyIsDown(p5.ENTER)) {
					gameService.emitReady({
						matchId: String($match?.matchId),
						userId
					});
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
				this.velocityX = 0;
				this.velocityY = 0;
				this.diam = 20;
				this.game = game;
				this.yminor = 0;
				this.ymajor = 0;
				this.xref = 0;
				this.sound = hitSound;
			}

			draw() {
				p5.circle(this.positionX, this.positionY, this.diam);
			}

			setMovement(data: Movement) {
				this.positionX = data.positionX;
				this.positionY = data.positionY;
				this.velocityX = data.velocityX;
				this.velocityY = data.velocityY;
			}

			move(delta: number) {
				this.positionX += this.velocityX * delta;
				this.positionY += this.velocityY * delta;
				let positionX = this.positionX;
				let positionY = this.positionY;
				gameService.emitBall({
					matchId: String($match?.matchId),
					pos: { positionX, positionY },
					userId
				});
			}
		}

		const boardColors: { [key: string]: number[] } = {
			white: [248, 250, 252],
			red: [239, 68, 68],
			orange: [249, 115, 22],
			yellow: [234, 179, 8],
			blue: [6, 182, 212],
			violet: [139, 92, 246],
			pink: [236, 72, 153],
			green: [34, 197, 94]
		};

		const boardColorSelected = localStorage.getItem('boardColor') || 'white';

		class Player {
			public player: string;
			public heightP: number;
			public widthP: number;
			public positionX: number;
			public positionY: number;
			public velocityY: number;

			constructor() {
				this.heightP = 60;
				this.widthP = 20;
				this.player = String($match?.as);
				if (this.player == 'p1') {
					//console.log('Position P1');
					this.positionX = 0;
				} else {
					this.positionX = width - this.widthP;
				}
				this.positionY = height / 2;
				this.velocityY = 15;

				let positionX = this.positionX;
				let positionY = this.positionY;
				gameService.emitPlayer(this.player, {
					matchId: String($match?.matchId),
					pos: { positionX, positionY },
					userId
				});
			}

			drawPlayer() {
				p5.fill(
					boardColors[boardColorSelected][0],
					boardColors[boardColorSelected][1],
					boardColors[boardColorSelected][2]
				);
				p5.rect(this.positionX, this.positionY, this.widthP, this.heightP);
				p5.fill(255, 255, 255);
			}

			setPositions(data: Positions) {
				this.positionX = data.positionX;
				this.positionY = data.positionY;
			}

			movePlayer() {
				if (p5.keyIsDown(p5.UP_ARROW)) {
					if (this.positionY > 0) {
						this.positionY -= this.velocityY;
					} else {
						this.positionY = 0;
					}
				}
				if (p5.keyIsDown(87)) {
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
				if (p5.keyIsDown(83)) {
					this.positionY += this.velocityY;
					if (this.positionY + this.heightP > height) {
						this.positionY = height - this.heightP;
					}
				}

				gameService.emitPlayer(this.player, {
					matchId: String($match?.matchId),
					pos: { positionX: this.positionX, positionY: this.positionY },
					userId
				});
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
				//this.ball.centerBall();
				this.running = true;
			}

			pointing(p: number) {
				if (p == 1) {
					if (this.pointP1 == 5) {
						this.gameOver(1);
						return;
					}
				} else if (p == 2) {
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
				//setTimeout(() => {
				//	this.restart();
				//}, 2000); // Pausa de 2 segundos antes de reiniciar
			}

			restartPoints() {
				this.pointP1 = this.pointP2 = 0;
			}

			restart() {
				this.running = false;
				this.pointP1 = 0;
				this.pointP2 = 0;
				this.winner = 0;
				//this.ball.centerBall();
			}

			setBall(ball: Ball) {
				this.ball = ball;
			}
		}
	}

	let gameNew: p5;

	onMount(async () => {
		gameService.connect();
		gameService.joinPlayerRoom(String($match?.matchId));

		let element: HTMLElement | null = window.document.getElementById('p5-container');
		if (!element) {
			return;
		}
		(<any>window).p5 = p5;
		await import('p5/lib/addons/p5.sound');
		console.log('Loaded Sound');
		gameNew = new p5(sketch, element);
	});

	onDestroy(() => {
		gameNew.remove();
		gameService.disconnect();
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
