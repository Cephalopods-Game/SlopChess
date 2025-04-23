import {
	_decorator,
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
import { Move } from './Move';
import { AI, Player, PlayerFactory, pType } from './Player';
import { Tile } from './Tile';
import { CustEvent, custEventTarget } from './Event';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
	user: Player = null;
	userTileQueue: Tile[] = [];
	mode: BoardMode;

	board: Board | null = null;
	moves: Move[] = [];
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

	start() {
		input.on(Input.EventType.MOUSE_UP, this.onLeftClickResetQueue, this);
		input.on(Input.EventType.KEY_UP, this.onRButton, this);
		custEventTarget.onTileClicked(this.onPlayerTileClick, this);
		custEventTarget.onPlayerMove(this.onPlayerMove, this);

		this.initGame({ rand: true, '4p': false }, null, null);
		custEventTarget.emitNextTurn(this.players[0], this.board);
	}

	initGame(
		options: { rand: boolean; '4p': boolean } = { rand: false, '4p': false },
		player1: Player,
		player2: Player,
		player3?: Player,
		player4?: Player
	) {
		this.mode = options['4p'] ? BoardMode.mul : BoardMode.sing;
		this.board.mode = this.mode;
		this.board.initBoard(options);

		if (this.mode === BoardMode.mul) {
			this.players = [
				this.playerFactory.getPlayer(pType.AI),
				this.playerFactory.getPlayer(pType.AI),
				this.playerFactory.getPlayer(pType.AI),
				this.playerFactory.getPlayer(pType.AI),
			];
			this.players[0].assignColor(Color.GREEN);
			this.players[1].assignColor(Color.MAGENTA);
			this.players[2].assignColor(Color.YELLOW);
			this.players[3].assignColor(Color.CYAN);
		} else {
			this.players = [this.playerFactory.getPlayer(pType.AI), this.playerFactory.getPlayer(pType.AI)];
			this.players[0].assignColor(Color.WHITE);
			this.players[1].assignColor(Color.GRAY);
		}

		this.curPlayer = this.players[0];
		this.user = this.players[0];
	}

	assignPlayer(player: Player) {}

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
		// not your turn
		if (this.turn % this.players.length !== this.players.indexOf(this.user)) return;

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
			custEventTarget.emitPlayerMove(this.user, firstTile, secondTile);
			this.userTileQueue = [];
		} else if (this.userTileQueue.length > 2) {
			this.userTileQueue = [];
		}
	}

	onPlayerMove(player: Player, from: Tile, to: Tile) {
		to.setPiece(from.getPiece());
		from.setPiece(null);
		this.afterMoveUpdate();
		this.turn++;
		const nextPlayer = this.players[(this.players.indexOf(this.curPlayer) + 1) % this.players.length];
		const prevPlayer = this.curPlayer;
		this.curPlayer = nextPlayer;
		custEventTarget.emitNextTurn(nextPlayer, this.board);
		// set color for visibility
		to.glowSwitch();
		from.glowSwitch();
	}

	afterMoveUpdate(): void {
		this.players.forEach((p) => {
			if (this.board.isCheckmate(p.color)) {
				this.losers.push(p);
				this.players.splice(this.players.indexOf(p), 1);
			}
			if (this.board.isStaleMate(p.color)) {
			}
		});
	}
}

// emit endgame -> change scene to endgame scene -> menu
