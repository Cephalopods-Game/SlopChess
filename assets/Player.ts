import { _decorator, CCClass, Color, Component, Node } from 'cc';
import { custEventTarget } from './Event';
import { Tile } from './Tile';
import { Board, BoardMode } from './Board';
import { Piece } from './Piece';
import * as chessEngine from './engine/lib/js-chess-engine';
import { Game } from './Game';

export enum pType {
	AI = 'AI',
	HUMAN = 'HUMAN',
}

export class PlayerFactory {
	getPlayer(type: pType, level: number = 2): Player {
		switch (type) {
			case pType.AI:
				const p = new AI(level);
				return p;
			case pType.HUMAN:
				return new Player();

			default:
				throw new Error('Invalid player type');
		}
	}
}

function shuffle<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function squareToXY(square: string): [number, number] {
	const file = square[0].toUpperCase();
	const rank = parseInt(square[1]);
	const y = file.charCodeAt(0) - 'A'.charCodeAt(0);
	const x = rank - 1;
	return [x, y];
}

export class Player {
	color: Color;

	assignColor(color: Color): void {
		this.color = color;
	}

	destroy(): void {}
}

export class AI extends Player {
	level: number;
	active: boolean = true;

	constructor(level: number = 2) {
		super();
		custEventTarget.onNextTurn(this.makeMove, this);
	}

	destroy(): void {
		this.active = false;
	}

	makeMove(player: Player, board: Board, game: Game): void {
		if (this.color != player.color || !this.active) return;
		if (board.mode == BoardMode.mul) this.makeRandomMove(board, game);
		else this.engineMove(board, this.level, game);
	}

	makeRandomMove(board: Board, game: Game) {
		// get all tiles with YOUR COLOR
		let tiles: Tile[] = [];
		for (const row of board.tiles)
			for (const tile of row) {
				const piece = tile?.getPiece();
				if (piece?.type && !piece.isDead && piece.color.equals(this.color)) tiles.push(tile);
			}

		// shuffle tiles
		tiles = shuffle(tiles);
		const a = [...Array(board.tiles.length).keys()];
		let b: { x: number; y: number }[] = [];
		for (const x of a) for (const y of a) b.push({ x, y });
		b = shuffle(b);
		for (const tile of tiles)
			for (const coord of b) {
				const to = board.tiles[coord.x][coord.y];
				if (!to) continue;
				if (tile?.getPiece()?.canMoveTo(board, tile, to)) {
					setTimeout(() => {
						custEventTarget.emitPlayerMove(tile, to);
						game.ws.send(
							JSON.stringify({
								type: 'message',
								from: { x: tile.x, y: tile.y },
								to: { x: to.x, y: to.y },
							})
						);
					}, 100);
					return;
				}
			}
	}

	// for 2p only
	engineMove(board: Board, level: number = 2, game: Game): void {
		const ownedTiles: Tile[] = [];
		const pieces = {};
		for (const row of board.tiles)
			for (const tile of row) {
				if (!tile) continue;
				const piece = tile.getPiece();
				if (piece.type && !piece.isDead) {
					const row = tile.x + 1;
					const col = String.fromCharCode(tile.y + 97).toUpperCase();
					pieces[col + row] = piece.color.equals(Color.WHITE) ? piece.type.toUpperCase() : piece.type.toLowerCase();
					if (piece.color.equals(this.color)) {
						ownedTiles.push(tile);
					}
				}
			}
		const moves = {};

		for (const ownedTile of ownedTiles)
			for (const row of board.tiles)
				for (const tile of row) {
					const to = tile;
					if (!to) continue;
					if (ownedTile?.getPiece()?.canMoveTo(board, ownedTile, to)) {
						const rowFrom = ownedTile.x + 1;
						const colFrom = String.fromCharCode(ownedTile.y + 97).toUpperCase();
						const rowTo = to.x + 1;
						const colTo = String.fromCharCode(to.y + 97).toUpperCase();
						if (moves[colFrom + rowFrom]) {
							moves[colFrom + rowFrom].push(colTo + rowTo);
						} else {
							moves[colFrom + rowFrom] = [colTo + rowTo];
						}
					}
				}

		const move = chessEngine.aiMove(
			{
				turn: this.color.equals(Color.WHITE) ? 'white' : 'black',
				pieces: pieces,
				isFinished: false,
				check: board.isInCheck(this.color),
				checkMate: board.isCheckmate(this.color),
				castling: {
					whiteLong: false,
					whiteShort: false,
					blackLong: false,
					blackShort: false,
				},
				moves: moves,
				halfMove: 0,
				fullMove: 1,
			},
			level
		);

		const from = squareToXY(Object.keys(move)[0]);
		const to = squareToXY(move[Object.keys(move)[0]]);

		setTimeout(() => {
			custEventTarget.emitPlayerMove(board.tiles[from[0]][from[1]], board.tiles[to[0]][to[1]]);
			game.ws.send(
				JSON.stringify({
					type: 'message',
					from: { x: from[0], y: from[1] },
					to: { x: to[0], y: to[1] },
				})
			);
		}, 100);
	}
}
