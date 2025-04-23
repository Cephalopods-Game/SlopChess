import { _decorator, Color, Component, ImageAsset, Node, resources, Sprite, SpriteFrame } from 'cc';
import { Tile } from './Tile';
import { Board, BoardMode, Dir } from './Board';
const { ccclass, property } = _decorator;

enum SpriteFrameUrl {
	p = 'Pawn/spriteFrame',
	n = 'Knight/spriteFrame',
	b = 'Bishop/spriteFrame',
	r = 'Rook/spriteFrame',
	q = 'Queen/spriteFrame',
	k = 'King/spriteFrame',
}

@ccclass('Piece')
export class Piece extends Component {
	type: string | null = null;
	color: Color | null = null;
	isDead: boolean = true;

	// king
	// hasCastled: boolean = false; NOT IMPLEMENTING THIS

	// pawn
	hasStarted: boolean = false;

	initPiece(type: string, color: Color): void {
		this.type = type;
		this.color = color;
		this.isDead = false;

		const sprite = this.getComponent(Sprite);
		if (sprite) {
			sprite.color = color;
		}

		resources.load(SpriteFrameUrl[type], SpriteFrame, (err, spriteFrame) => {
			if (err) {
				console.error('Error loading sprite frame:', err);
				return;
			}
			const sprite = this.getComponent(Sprite);
			if (sprite) {
				sprite.spriteFrame = spriteFrame;
			}
		});
	}

	copyPiece(piece: Piece | null): void {
		if (!piece) {
			this.type = null;
			this.color = null;
			this.isDead = true;
			// this.hasCastled = false;
			this.hasStarted = false;
			this.node.active = false;
			return;
		}
		this.node.active = true;
		this.type = piece.type;
		this.color = piece.color;
		this.isDead = piece.isDead;
		// this.hasCastled = piece.hasCastled;
		this.hasStarted = piece.hasStarted;
		this.getComponent(Sprite).color = piece.color;
		// this.getComponent(Sprite).spriteFrame = piece.getComponent(Sprite).spriteFrame;
		resources.load(SpriteFrameUrl[this.type], SpriteFrame, (err, spriteFrame) => {
			if (err) {
				console.error('Error loading sprite frame:', err);
				return;
			}
			const sprite = this.getComponent(Sprite);
			if (sprite) {
				sprite.spriteFrame = spriteFrame;
			}
		});
	}

	canMoveTo(board: Board, from: Tile, to: Tile, moreCheck: boolean = true): boolean {
		const p1 = from.getPiece();
		const p2 = to.getPiece();

		if (p1?.isDead) return false; // dead piece

		const dir = board.colorToDir(p1.color);

		const dx = Math.abs(to.x - from.x);
		const dy = Math.abs(to.y - from.y);

		if (from.x === to.x && from.y === to.y) return false; // same tile
		if (p1.color === p2.color) return false; // same color

		// king
		// add check later
		if (p1.type === 'k') {
			// check if king is moving 1 tile in any direction
			if (!(dx <= 1 && dy <= 1)) {
				return false;
			}
		}

		//pawn
		if (p1.type === 'p') {
			// forward move
			const uCond = dir == Dir.up && to.x === from.x + 1 && to.y === from.y && !p2.type;
			const dCond = dir == Dir.down && to.x === from.x - 1 && to.y === from.y && !p2.type;
			const lCond = dir == Dir.left && to.y === from.y - 1 && to.x === from.x && !p2.type;
			const rCond = dir == Dir.right && to.y === from.y + 1 && to.x === from.x && !p2.type;

			// diagonal take
			const udCond = dir == Dir.up && (to.y === from.y + 1 || to.y === from.y - 1) && to.x === from.x + 1 && p2.type;
			const ddCond = dir == Dir.down && (to.y === from.y + 1 || to.y === from.y - 1) && to.x === from.x - 1 && p2.type;
			const ldCond = dir == Dir.left && (to.x === from.x + 1 || to.x === from.x - 1) && to.y === from.y - 1 && p2.type;
			const rdCond = dir == Dir.right && (to.x === from.x + 1 || to.x === from.x - 1) && to.y === from.y + 1 && p2.type;

			// 2 forward move
			const val2 = (dx == 2 || dy == 2) && !p1.hasStarted;
			const ubCond = dir == Dir.up && to.x === from.x + 2 && to.y === from.y && !p2.type;
			const dbCond = dir == Dir.down && to.x === from.x - 2 && to.y === from.y && !p2.type;
			const lbCond = dir == Dir.left && to.y === from.y - 2 && to.x === from.x && !p2.type;
			const rbCond = dir == Dir.right && to.y === from.y + 2 && to.x === from.x && !p2.type;

			if (
				!(
					uCond ||
					dCond ||
					lCond ||
					rCond ||
					udCond ||
					ddCond ||
					ldCond ||
					rdCond ||
					(val2 && (ubCond || dbCond || lbCond || rbCond) && board.isPathClear(from, to))
				)
			)
				return false;
		}

		// knight
		if (p1.type === 'n') {
			// check if knight is moving in L shape
			if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) return false;
		}

		// rook
		if (p1.type === 'r') {
			// check if straight line
			if (!((dx === 0 || dy === 0) && board.isPathClear(from, to))) return false;
		}

		// bishop
		if (p1.type === 'b') {
			// check if diagonal
			if (!(dx === dy && board.isPathClear(from, to))) return false;
		}

		// queen
		if (p1.type === 'q') {
			// check if straight line or diagonal
			if (!((dx === 0 || dy === 0 || dx === dy) && board.isPathClear(from, to))) return false;
		}

		// if it moves and king is in check
		if (moreCheck) {
			const p1State = {
				type: p1.type,
				color: p1.color,
				isDead: p1.isDead,
				hasStarted: p1.hasStarted,
			};
			const p2State = {
				type: p2.type,
				color: p2.color,
				isDead: p2.isDead,
				hasStarted: p2.hasStarted,
			};
			p2.tempCopyPiece({ ...p1State, hasStarted: true });
			p1.tempCopyPiece({ type: null, color: null, isDead: true, hasStarted: false });

			let willBeInCheck: boolean;
			if (board.isInCheck(p1State.color)) willBeInCheck = true;
			p1.tempCopyPiece(p1State);
			p2.tempCopyPiece(p2State);
			if (willBeInCheck) return false; // if it moves and king is in check
		}

		// everything passed
		p1.hasStarted = true;

		// queen condition
		if (p1.type === 'p') {
			if (dir == Dir.up && to.x === (board.mode === BoardMode.mul ? 13 : 7)) p1.type = 'q';
			else if (dir == Dir.down && to.x === 0) p1.type = 'q';
			else if (dir == Dir.left && to.y === 0) p1.type = 'q';
			else if (dir == Dir.right && to.y === 13) p1.type = 'q';
		}
		return true;
	}

	tempCopyPiece(options: { type: string | null; color: Color | null; isDead: boolean; hasStarted: boolean }): void {
		this.type = options.type;
		this.color = options.color;
		this.isDead = options.isDead;
		this.hasStarted = options.hasStarted;
	}

	isEmpty(): boolean {
		return this.type === null;
	}
}
