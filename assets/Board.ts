import { _decorator, Color, Component, instantiate, Node, Prefab, Sprite, UITransform } from 'cc';
import { Tile } from './Tile';
import { Piece } from './Piece';
const { ccclass, property } = _decorator;

export enum BoardMode {
	sing = 'normal',
	mul = 'fourPlayer',
}

export enum Dir {
	up,
	down,
	left,
	right,
}

@ccclass('Board')
export class Board extends Component {
	mode: BoardMode;
	tiles: (Tile | null)[][];
	displayTiles: (Tile | null)[][];

	@property(Prefab)
	tilePrefab: Prefab;

	colorToDir(color: Color): Dir {
		if (this.mode === BoardMode.sing) {
			return color === Color.WHITE ? Dir.up : Dir.down;
		}

		if (this.mode === BoardMode.mul) {
			if (color === Color.GREEN) return Dir.up;
			if (color === Color.YELLOW) return Dir.down;
			if (color === Color.CYAN) return Dir.right;
			if (color === Color.MAGENTA) return Dir.left;
		}
	}

	isValidTile(x: number, y: number): boolean {
		if (this.mode === BoardMode.mul) {
			return x >= 0 && x < 14 && y >= 0 && y < 14;
		}
		return x >= 0 && x < 8 && y >= 0 && y < 8;
	}

	getTile(x: number, y: number): Tile | null {
		return this.tiles[x][y];
	}

	getPieces(rand: boolean): string[] {
		const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
		if (rand) return this.generateChess960BackRank();
		return backRank;
	}

	generateChess960BackRank(): string[] {
		const positions = Array(8).fill(null);

		// 1. Place bishops on opposite colors
		const darkSquares = [0, 2, 4, 6];
		const lightSquares = [1, 3, 5, 7];
		const bishop1 = darkSquares[Math.floor(Math.random() * darkSquares.length)];
		const bishop2 = lightSquares[Math.floor(Math.random() * lightSquares.length)];
		positions[bishop1] = 'b';
		positions[bishop2] = 'b';

		// 2. Place queen
		const empty = positions.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
		const queenPos = empty[Math.floor(Math.random() * empty.length)];
		positions[queenPos] = 'q';

		// 3. Place knights
		const remaining = positions.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
		const knight1 = remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0];
		const knight2 = remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0];
		positions[knight1] = 'n';
		positions[knight2] = 'n';

		// 4. Place king between rooks
		let leftover = positions.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
		leftover = leftover.sort((a, b) => (a > b ? a : b)); // shuffle remaining 3 slots
		positions[leftover[0]] = 'r';
		positions[leftover[1]] = 'k';
		positions[leftover[2]] = 'r';

		return positions;
	}

	generateTiles(mp: boolean): void {
		if (mp) {
			this.generate4PTiles();
		} else {
			this.generateNormalTiles();
		}
		this.displayBoard();
	}

	generateNormalTiles(): void {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				// instantiate tile
				const tile = instantiate(this.tilePrefab);
				this.node.addChild(tile);
				if ((i + j) % 2 !== 0) {
					const sprite = tile.getComponent(Sprite);
					if (sprite) sprite.color = Color.WHITE;
				} else {
					const sprite = tile.getComponent(Sprite);
					if (sprite) sprite.color = Color.BLACK;
				}
				// add to tiles[][]
				tile?.getComponent(Tile)?.setBoardPos(i, j);
				this.tiles[i][j] = tile?.getComponent(Tile);
				this.displayTiles[i][j] = this.tiles[i][j];
			}
		}
	}

	generate4PTiles(): void {
		const blockedOff = [0, 1, 2, 11, 12, 13];

		for (let i = 0; i < 14; i++) {
			for (let j = 0; j < 14; j++) {
				// skip blocked off tiles
				if (blockedOff.includes(i) && blockedOff.includes(j)) continue;
				// instantiate tile
				const tile = instantiate(this.tilePrefab);
				this.node.addChild(tile);
				if ((i + j) % 2 !== 0) {
					const sprite = tile.getComponent(Sprite);
					if (sprite) sprite.color = Color.WHITE;
				} else {
					const sprite = tile.getComponent(Sprite);
					if (sprite) sprite.color = Color.BLACK;
				}
				// add to tiles[][]
				tile?.getComponent(Tile)?.setBoardPos(i, j);
				this.tiles[i][j] = tile?.getComponent(Tile);
				this.displayTiles[i][j] = this.tiles[i][j];
			}
		}
	}

	generateNormalPieces(mp: boolean, backRank: string[]): void {
		for (let j = 0; j < 8; j++) {
			this.tiles[1][j].getPiece()?.initPiece('p', Color.WHITE);
			this.tiles[0][j].getPiece()?.initPiece(backRank[j], Color.WHITE);
			this.tiles[6][j].getPiece()?.initPiece('p', Color.GRAY);
			this.tiles[7][j].getPiece()?.initPiece(backRank[j], Color.GRAY);
		}
	}

	generate4PPieces(mp: boolean, backRank: string[]): void {
		let g = 0;
		for (let j = 3; j < 11; j++) {
			this.tiles[1][j].getPiece()?.initPiece('p', Color.GREEN);
			this.tiles[0][j].getPiece()?.initPiece(backRank[g], Color.GREEN);
			this.tiles[12][j].getPiece()?.initPiece('p', Color.YELLOW);
			this.tiles[13][j].getPiece()?.initPiece(backRank[backRank.length - 1 - g], Color.YELLOW);
			g++;
		}
		g = 0;
		for (let i = 3; i < 11; i++) {
			this.tiles[i][1].getPiece()?.initPiece('p', Color.CYAN);
			this.tiles[i][0].getPiece()?.initPiece(backRank[g], Color.CYAN);
			this.tiles[i][12].getPiece()?.initPiece('p', Color.MAGENTA);
			this.tiles[i][13].getPiece()?.initPiece(backRank[backRank.length - 1 - g], Color.MAGENTA);
			g++;
		}
	}

	generatePieces(mp: boolean, backRank: string[]): void {
		if (mp) {
			//4p
			this.generate4PPieces(mp, backRank);
		} else {
			//2p
			this.generateNormalPieces(mp, backRank);
		}
	}

	start(): void {}

	initBoard(options: { rand: boolean; '4p': boolean } = { rand: false, '4p': false }, bR?: any): void {
		if (options['4p']) {
			this.tiles = new Array(14).fill(null).map(() => new Array(14).fill(null));
			this.displayTiles = new Array(14).fill(null).map(() => new Array(14).fill(null));
			this.mode = BoardMode.mul;
		} else {
			this.tiles = new Array(8).fill(null).map(() => new Array(8).fill(null));
			this.displayTiles = new Array(8).fill(null).map(() => new Array(8).fill(null));
			this.mode = BoardMode.sing;
		}

		this.generateTiles(options['4p']);
		let backRank: string[] = [];
		if (!bR) backRank = this.getPieces(options.rand);
		else backRank = bR;

		this.generatePieces(options['4p'], backRank);
	}

	isPathClear(from: Tile, to: Tile): boolean {
		const dx = Math.sign(to.x - from.x);
		const dy = Math.sign(to.y - from.y);
		let x = from.x + dx;
		let y = from.y + dy;
		while (x !== to.x || y !== to.y) {
			if (!this.isValidTile(x, y) || this.getTile(x, y) == null || this.getTile(x, y).getPiece().type) {
				return false;
			}
			x += dx;
			y += dy;
		}
		return true;
	}

	isInCheck(color: Color): boolean {
		// Check if the king of the given color is in check
		let kingTile: Tile | null = null;

		for (let i = 0; i < this.tiles.length; i++) {
			for (let j = 0; j < this.tiles[i].length; j++) {
				const piece = this.tiles[i][j]?.getPiece();
				if (piece && piece.type === 'k' && piece.color.equals(color)) {
					kingTile = this.tiles[i][j];
					break;
				}
			}
		}

		if (!kingTile) {
			console.error('King not found on the board!', color);
			// console.log(color.equals(Color.GRAY));
			return true; // King not found, cannot determine check status
		}

		for (let i = 0; i < (this.mode === BoardMode.mul ? 14 : 8); i++) {
			for (let j = 0; j < (this.mode === BoardMode.mul ? 14 : 8); j++) {
				if (i === kingTile.x && j === kingTile.y) continue; // skip the king tile
				const piece = this.tiles[i][j]?.getPiece();
				if (piece && piece.type && piece.color != color && piece.canMoveTo(this, this.tiles[i][j], kingTile, false)) {
					return true; // Found an attacking piece that can move to the king's position
				}
			}
		}
		return false;
	}

	hasMoveLeft(tiles: Tile[]): boolean {
		for (const tile of tiles) {
			for (let i = 0; i < this.tiles.length; i++) {
				for (let j = 0; j < this.tiles[i].length; j++) {
					const toTile = this.tiles[i][j];
					if (toTile == null) continue;
					if (tile?.getPiece()?.canMoveTo(this, tile, toTile, true)) {
						return true; // Found a valid move for the piece
					}
				}
			}
		}
		return false;
	}

	// 0 optimization on god
	isCheckmate(color: Color): boolean {
		if (!this.isInCheck(color)) return false; // Not in check, so not checkmate

		const tiles: Tile[] = [];
		for (const row of this.tiles) for (const tile of row) if (tile?.getPiece()?.color?.equals(color)) tiles.push(tile);

		// If still have valid move
		if (this.hasMoveLeft(tiles)) return false;
		console.log('Checkmate!', color);

		// mark the pieces as dead
		for (const tile of tiles) {
			const piece = tile.getPiece();
			if (piece) {
				piece.isDead = true;
				piece.color = Color.BLACK;
				piece.getComponent(Sprite).color = Color.BLACK;
			}
		}
		return true;
	}

	isStaleMate(color: Color): boolean {
		if (this.isInCheck(color)) return false; // In check, so not stalemate

		const tiles: Tile[] = [];
		for (const row of this.tiles) for (const tile of row) if (tile?.getPiece()?.color?.equals(color)) tiles.push(tile);

		// If still have valid move
		if (this.hasMoveLeft(tiles)) return false;

		console.log('STALEMATE');
		return true;
	}

	flipBoardDisplay(): void {
		console.log('flipping board display');

		const rows = this.mode === BoardMode.mul ? 14 : 8;
		const cols = this.mode === BoardMode.mul ? 14 : 8;
		const rotated: Tile[][] = [];

		for (let col = 0; col < cols; col++) {
			const newRow: Tile[] = [];
			for (let row = rows - 1; row >= 0; row--) {
				newRow.push(this.displayTiles[row][col]);
			}
			rotated.push(newRow);
		}

		this.displayTiles = rotated;
		this.displayBoard();
	}

	displayBoard(): void {
		const rows = this.mode === BoardMode.mul ? 14 : 8;
		const cols = this.mode === BoardMode.mul ? 14 : 8;

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const tile = this.displayTiles[i][j];
				if (tile) {
					tile.node.setPosition(
						j * tile.getComponent(UITransform)?.contentSize.x * tile.node.getScale().x,
						i * tile.getComponent(UITransform)?.contentSize.y * tile.node.getScale().y
					);
				}
			}
		}
	}
}
