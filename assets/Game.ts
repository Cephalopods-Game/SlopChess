import {
	_decorator,
	AudioSource,
	Color,
	Component,
	director,
	EventKeyboard,
	EventMouse,
	input,
	Input,
	KeyCode,
	macro,
	Node,
	profiler,
} from 'cc';
import { Board, BoardMode } from './Board';
import { AI, Player, PlayerFactory, pType } from './Player';
import { Tile } from './Tile';
import { CustEvent, custEventTarget } from './Event';
import { sceneManager } from './scene/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
	ws: WebSocket;

	user: Player = null;
	userTileQueue: Tile[] = [];
	mode: BoardMode;

	board: Board | null = null;
	players: Player[] = [];
	curPlayer: Player = null;
	turn: number = 0;
	losers: Player[] = [];
	playerFactory: PlayerFactory = new PlayerFactory();

	onLoad() {
		macro.ENABLE_WEBGL_ANTIALIAS = false;
		profiler.hideStats();
		this.board = this.node.getComponentInChildren(Board);
	}

	joinRoom(room: string, mul: boolean = false, rand: boolean = false) {
		const sMul = mul;
		const sRand = rand;
		this.ws = new WebSocket('ws://localhost:8080');
		this.ws.onopen = () => {
			this.ws.send(JSON.stringify({ type: 'join', room, mul: sMul, rand: sRand }));
			console.log(`Joined room ${room}`);
		};

		this.ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log(data);
			if (data.type == 'joined') {
				console.log(`Idx ${data.curIdx} ${data.mul} ${data.rand}`);

				if (this.user == null) {
					if (data.curIdx != 0) {
						this.initGame(
							{
								'4p': data.mul,
								rand: data.rand,
							},
							data.curIdx
						);
					}
				} else {
					console.log('REPLACING AI WITH PLAYER AT IDX', data.curIdx);
					this.players[data.curIdx].destroy();
					const color = this.players[data.curIdx].color.clone();
					this.players[data.curIdx] = this.playerFactory.getPlayer(pType.HUMAN);
					this.players[data.curIdx].color = color.clone();
					console.log('NEW COLOR IS ', this.players[data.curIdx].color);
				}
			}
			if (data.type == 'message' && this) {
				const from = this.board.getTile(data.from.x, data.from.y);
				console.log(from.getPiece()?.type, from.getPiece()?.color);
				const to = this.board.getTile(data.to.x, data.to.y);
				console.log(to.getPiece()?.type, to.getPiece()?.color);
				custEventTarget.emitPlayerMove(from, to);
			}
		};
	}

	start() {}

	initGame(
		options: { rand: boolean; '4p': boolean; level?: number } = { rand: false, '4p': false, level: 2 },
		playerIdx: number,
		player1: pType = pType.HUMAN,
		player2: pType = pType.AI,
		player3: pType = pType.AI,
		player4: pType = pType.AI
	) {
		input.on(Input.EventType.MOUSE_UP, this.onLeftClickResetQueue, this);
		input.on(Input.EventType.KEY_UP, this.onRButton, this);
		custEventTarget.onTileClicked(this.onPlayerTileClick, this);
		custEventTarget.onPlayerMove(this.onPlayerMove, this);
		custEventTarget.emitNextTurn(this.players[0], this.board, this);

		this.mode = options['4p'] ? BoardMode.mul : BoardMode.sing;
		this.board.mode = this.mode;
		this.board.initBoard(options);

		if (playerIdx != 0) {
			player1 = pType.HUMAN;
			player2 = pType.HUMAN;
			player3 = pType.HUMAN;
			player4 = pType.HUMAN;
		}

		if (this.mode === BoardMode.mul) {
			this.players = [
				this.playerFactory.getPlayer(player1),
				this.playerFactory.getPlayer(player2),
				this.playerFactory.getPlayer(player3),
				this.playerFactory.getPlayer(player4),
			];
			this.players[0].assignColor(Color.GREEN);
			this.players[1].assignColor(Color.MAGENTA);
			this.players[2].assignColor(Color.YELLOW);
			this.players[3].assignColor(Color.CYAN);
		} else {
			this.players = [this.playerFactory.getPlayer(player1), this.playerFactory.getPlayer(player2)];
			this.players[0].assignColor(Color.WHITE);
			this.players[1].assignColor(Color.GRAY);
		}

		this.curPlayer = this.players[0];
		this.user = this.players[playerIdx];
		console.log(options);
		console.log('default', options['4p'], options.rand);
		if (playerIdx == 0) this.joinRoom('default', options['4p'], options.rand);
		this.setCameraPos();
	}

	onLeftClickResetQueue(event: EventMouse) {
		// listens to left click event
		if (event.getButton() === EventMouse.BUTTON_RIGHT) {
			this.userTileQueue = [];
			return;
		}
	}

	onRButton(event: EventKeyboard) {
		if (event.keyCode === KeyCode.KEY_R) {
			this.board.flipBoardDisplay();
		}
	}

	onPlayerTileClick(tile: Tile) {
		console.log(this.turn % this.players.length);
		console.log(this.players.indexOf(this.user));
		// not your turn
		if (this.turn % this.players.length !== this.players.indexOf(this.user)) return;
		console.log('is your turn');

		// you cant tile that is not yours dumbass
		if (tile.getPiece()?.color != this.user.color && this.userTileQueue.length === 0) {
			return;
		}
		this.userTileQueue.push(tile);

		if (this.userTileQueue.length === 2) {
			const firstTile = this.userTileQueue[0];
			const secondTile = this.userTileQueue[1];
			// invalid move
			if (!firstTile.getPiece().canMoveTo(this.board, firstTile, secondTile)) {
				this.userTileQueue = [];
				return;
			}
			custEventTarget.emitPlayerMove(firstTile, secondTile);
			this.ws.send(
				JSON.stringify({
					type: 'message',
					from: { x: firstTile.x, y: firstTile.y },
					to: { x: secondTile.x, y: secondTile.y },
				})
			);
			this.userTileQueue = [];
		} else if (this.userTileQueue.length > 2) {
			this.userTileQueue = [];
		}
	}

	onPlayerMove(from: Tile, to: Tile) {
		from.getPiece()?.canMoveTo(this.board, from, to);
		if (to.getPiece()?.type) to.node.getComponentsInChildren(AudioSource)[1]?.play();
		else to.node.getComponentsInChildren(AudioSource)[0]?.play();
		to.setPiece(from.getPiece());
		from.setPiece(null);
		this.afterMoveUpdate();
		this.turn++;
		const nextPlayer = this.players[(this.players.indexOf(this.curPlayer) + 1) % this.players.length];
		const prevPlayer = this.curPlayer;
		this.curPlayer = nextPlayer;
		custEventTarget.emitNextTurn(nextPlayer, this.board, this);
		// set color for visibility
		to.glowSwitch();
		from.glowSwitch();
	}

	afterMoveUpdate(): void {
		this.players.forEach((p) => {
			if (this.board.isCheckmate(p.color)) {
				this.losers.push(p);
				this.players.splice(this.players.indexOf(p), 1);
			} else if (this.board.isStaleMate(p.color)) {
				for (const p of this.players) {
					this.losers.push(p);
				}
				return;
			}
		});
		if (this.players.length <= 1) sceneManager.showResult(this.players, this.losers);
	}

	setCameraPos(): void {
		if (this.mode == BoardMode.mul) {
			const pos = this.board.tiles[7][7].node.getWorldPosition();
			const cam = this.node.getChildByName('Camera').setWorldPosition(pos);
			// const scale = this.node.getChildByName('Board').getScale();
			// const s = 3;
			// this.node.getChildByName('Board').setScale(scale.x * s, scale.y * s, scale.z * s);
		} else {
			const pos = this.board.tiles[4][4].node.getWorldPosition();
			const cam = this.node.getChildByName('Camera').setWorldPosition(pos);
			// const scale = this.node.getChildByName('Board').getScale();
			// const s = 3;
			// this.node.getChildByName('Board').setScale(scale.x * s, scale.y * s, scale.z * s);
		}
	}
}

// emit endgame -> change scene to endgame scene -> menu
