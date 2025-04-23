import { EventTarget } from 'cc';
import { Tile } from './Tile';
import { Player } from './Player';
import { Board } from './Board';
import { Game } from './Game';
const eventTarget = new EventTarget();

export enum CustEvent {
	TILE_CLICKED = 'TILE_CLICKED',
	PLAYER_MOVE = 'PLAYER_MOVE',
	NEXT_TURN = 'NEXT_TURN',
}

class custEventHandler {
	emitTileClicked(tile: Tile) {
		eventTarget.emit(CustEvent.TILE_CLICKED, tile);
	}

	onTileClicked(cb: (tile: Tile, ...args: any[]) => any, thisArg?: any) {
		eventTarget.on(CustEvent.TILE_CLICKED, cb, thisArg);
	}

	emitPlayerMove(from: Tile, to: Tile) {
		eventTarget.emit(CustEvent.PLAYER_MOVE, from, to);
	}

	onPlayerMove(cb: (from: Tile, to: Tile, ...args: any[]) => any, thisArg?: any) {
		eventTarget.on(CustEvent.PLAYER_MOVE, cb, thisArg);
	}

	emitNextTurn(player: Player, board: Board, game: Game) {
		eventTarget.emit(CustEvent.NEXT_TURN, player, board, game);
	}

	onNextTurn(cb: (player: Player, board: Board, ...args: any[]) => any, thisArg?: any) {
		eventTarget.on(CustEvent.NEXT_TURN, cb, thisArg);
	}
}

export const custEventTarget = new custEventHandler();
