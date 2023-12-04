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

		/**
		 * Listens for the 'is-ready' event from the game socket.
		 * If the received data is 1, starts the game.
		 * If the received data is 2 or 0, stops the game (indicating player disconnection).
		 */
		gameService.getSocket().on('is-ready', (data) => {
			if (data == true) {
				game.start();
			} else if (data == false) {
				game.stop();
			}
		});

		/**
		 * Listens for the 'scoreboard' event from the game socket and updates the game's player scores.
		 *
		 * @param {Object} data - The data received from the 'scoreboard' event.
		 */
		gameService.getSocket().on('scoreboard', (data) => {
			game.pointP1 = data.p1Score;
			game.pointP2 = data.p2Score;
			console.log('Pontos p1: ' + game.pointP1 + ' /Pontos p2: ' + game.pointP2);
		});

		/**
		 * Listens for the 'finished' event from the game socket and handles the game over logic.
		 * @param {Object} data - The data received from the 'finished' event.
		 * @returns {void}
		 */
		gameService.getSocket().on('finished', (data) => {
			game.stop();
			game.gameOver(data.winner);
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

		gameService.getSocket().on('abandon-match', (data) => {
			console.log('abandon-match', data);
			if (data) {
				game.stop();
				goto('/endgame');
			}
		});

		/**
		 * Sets up the game canvas and initializes game objects.
		 * @returns {Promise<void>}
		 */
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

		/**
		 * Object that maps color names to their corresponding hexadecimal values.
		 * @type {Object<string, string>}
		 */
		const backgroundColors: { [key: string]: string } = {
			black: '#030712',
			red: '#f87171',
			blue: '#22d3ee',
			green: '#4ade80',
			pink: '#f472b6',
			yellow: '#facc15'
		};

		const backgroundColorSelected: string = localStorage.getItem('backgroundColor') || 'black';
		let showStartText = true;
		let pressedEnter = false;

		/**
		 * Function that is called by the p5.js library to draw the game page.
		 * It updates the game state, draws the players, ball, score, and victory text.
		 * If the game is running, it moves the player based on the match.as value.
		 * If there is a winner, it displays the victory text.
		 * If the game is not running and there is no winner, it listens for the ENTER key press to emit the ready event.
		 */
		p5.draw = () => {
			const now = Date.now();
			const delta = (now - lastUpdate) / 1000;
			lastUpdate = now;

			p5.background(backgroundColors[backgroundColorSelected]);
			p5.fill(255);
			p5.rect(width / 2, 0, 5, height);

			player1.drawPlayer();
			player2.drawPlayer();

			let scoreText = `${game.pointP1}    ${game.pointP2}`;
			p5.textSize(72);
			p5.fill(250, 204, 21);
			p5.text(scoreText, width / 2, 60);

			if (!game.running && showStartText) {
				p5.textAlign(p5.CENTER, p5.CENTER);
				
				p5.textSize(32);
				p5.textStyle(p5.BOLD);
				p5.textFont('Arial');
				p5.text('Press ENTER to start', width / 2, height / 2 - 50);
				p5.textSize(24);
				p5.text('Use W/S or UP/DOWN to move', width / 2, height / 2);
				p5.text('First to reach 5 points wins', width / 2, height / 2 + 50);
			}
			if (game.running == true) {
				ball1.draw();

				if ($match?.as == 'p1') {
					player1.movePlayer();
				} else {
					player2.movePlayer();
				}
			}
			if (game.winner) {
				game.stop();
			} else if (!game.winner && !game.running) {
				if (p5.keyIsDown(p5.ENTER)) {
					gameService.emitReady({
						matchId: String($match?.matchId),
						userId
					});
					pressedEnter = true;
				}
				if (pressedEnter) {
					showStartText = false;
					p5.textSize(24);
					p5.fill(255);
					p5.text('Waiting Opponent press ENTER', width / 2, height / 2);
				}
			}
		};

		/**
		 * Represents a ball in the game.
		 */
		class Ball {
			/**
			 * The X position of the ball.
			 */
			public positionX: number;
			/**
			 * The Y position of the ball.
			 */
			public positionY: number;
			/**
			 * The X velocity of the ball.
			 */
			public velocityX: number;
			/**
			 * The Y velocity of the ball.
			 */
			public velocityY: number;
			/**
			 * The diameter of the ball.
			 */
			public diam: number;
			/**
			 * The game instance the ball belongs to.
			 */
			public game: Game;
			/**
			 * The minor Y value of the ball.
			 */
			public yminor: number;
			/**
			 * The major Y value of the ball.
			 */
			public ymajor: number;
			/**
			 * The X reference value of the ball.
			 */
			public xref: number;
			/**
			 * The sound file associated with the ball.
			 */
			public sound: p5.SoundFile;

			/**
			 * Creates a new instance of the Ball class.
			 * @param game - The game instance the ball belongs to.
			 */
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

			/**
			 * Draws a circle at the specified position with the specified diameter.
			 */
			draw() {
				p5.circle(this.positionX, this.positionY, this.diam);
			}

			/**
			 * Sets the movement of the game object.
			 * @param {Movement} data - The movement data.
			 */
			setMovement(data: Movement) {
				this.positionX = data.positionX;
				this.positionY = data.positionY;
			}

			/**
			 * Moves the ball based on the given delta.
			 * @param {number} delta - The time delta.
			 */
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

			/**
			 * Constructor function for the game page component.
			 * Initializes the player's position and velocity.
			 * Emits the player's information to the game service.
			 */
			constructor() {
				this.heightP = 60;
				this.widthP = 20;
				this.player = String($match?.as);
				if (this.player == 'p1') {
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

			/**
			 * Draws the player on the game board.
			 */
			drawPlayer() {
				p5.fill(
					boardColors[boardColorSelected][0],
					boardColors[boardColorSelected][1],
					boardColors[boardColorSelected][2]
				);
				p5.rect(this.positionX, this.positionY, this.widthP, this.heightP);
				p5.fill(255, 255, 255);
			}

			/**
			 * Sets the positions of the game elements.
			 * @param {Positions} data - The positions data object.
			 */
			setPositions(data: Positions) {
				this.positionX = data.positionX;
				this.positionY = data.positionY;
			}

			/**
			 * Moves the player based on the keyboard input.
			 * If the UP_ARROW or 'W' key is pressed, the player moves up.
			 * If the DOWN_ARROW or 'S' key is pressed, the player moves down.
			 * The player's position is updated and emitted to the game service.
			 */
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

		/**
		 * Represents a game.
		 */
		class Game {
			/**
			 * Indicates whether the game is currently running.
			 */
			public running: boolean;

			/**
			 * The number of points for player 1.
			 */
			public pointP1: number;

			/**
			 * The number of points for player 2.
			 */
			public pointP2: number;

			/**
			 * The ball object used in the game.
			 */
			public ball: Ball;

			/**
			 * The winner of the game.
			 */
			public winner: number;

			/**
			 * Creates a new instance of the Game class.
			 */
			constructor() {
				this.running = false;
				this.pointP1 = 0;
				this.pointP2 = 0;
				this.ball = new Ball(this);
				this.winner = 0;
			}

			/**
			 * Stops the game.
			 */
			stop() {
				this.running = false;
			}

			/**
			 * Starts the game.
			 */
			start() {
				this.running = true;
				showStartText = false;
			}

			/**
			 * Updates the points and checks for game over.
			 * @param p - The player who scored the point.
			 */
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

			/**
			 * Ends the game and sets the winner.
			 * @param winner - The player who won the game.
			 */
			gameOver(winner: number) {
				this.running = false;
				this.winner = winner;
				goto('/endgame');
			}

			/**
			 * Restarts the points to zero.
			 */
			restartPoints() {
				this.pointP1 = this.pointP2 = 0;
			}

			/**
			 * Sets the ball object used in the game.
			 * @param ball - The ball object.
			 */
			setBall(ball: Ball) {
				this.ball = ball;
			}
		}
	}

	let gameNew: p5;

	/**
	 * Initializes the game on mount.
	 * Connects to the game service, joins the player room, and loads the sound.
	 * Creates a new p5 instance and assigns it to the 'gameNew' variable.
	 */
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
	/**
	 * Removes the game element and disconnects from the game service.
	 */
	onDestroy(() => {
		gameNew.remove();
	});

	function abandonMatch() {
		const playerType = $match?.as;
		const matchId = $match?.matchId;

		if (playerType && matchId) {
			gameService.getSocket().emit('abandon-match', { matchId, by: playerType });
		}
	}
</script>

<div class="min-h-screen h-full flex flex-col">
	<PongHeader />
	<div class="flex flex-col justify-end items-end">
		<button on:click={abandonMatch} class="mr-10 mt-10"
			><i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" /></button
		>
	</div>
	<div class="flex w-full items-center justify-center grow">
		<div class="w-fit flex items-center justify-center p-5 bg-slate-500 rounded-lg">
			<div id="p5-container" />
		</div>
	</div>
</div>
