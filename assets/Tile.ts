import { _decorator, Color, Component, EventMouse, input, Input, Node, Sprite } from 'cc';
import { Piece } from './Piece';
import { custEventTarget, CustEvent } from './Event';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {
	x: number = 0;
	y: number = 0;
	piece: Piece | null = null;

	color: Color = Color.YELLOW;
	highLight: Color = Color.RED;

	onLoad(): void {
		this.piece = this.getComponentInChildren(Piece);
	}

	setNormalColor(): void {
		const sprite = this.node.getComponent(Sprite);
		if ((this.x + this.y) % 2 === 0) {
			sprite.color = Color.BLACK;
			// console.log(sprite.color);
		} else sprite.color = Color.WHITE;
	}

	start(): void {
		this.node.on(Input.EventType.MOUSE_UP, this.onTileClicked, this);

		custEventTarget.onNextTurn(() => {
			this.setNormalColor();
		}, this);
	}

	onTileClicked(event: EventMouse): void {
		if (event.getButton() === EventMouse.BUTTON_LEFT) {
			custEventTarget.emitTileClicked(this);
		}
	}

	getPiece(): Piece | null {
		return this.piece;
	}

	setPiece(piece: Piece | null): void {
		this.piece.copyPiece(piece);
	}

	setBoardPos(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	update(deltaTime: number): void {}

	glowSwitch(): void {
		const sprite = this.getComponent(Sprite);
		if (sprite) {
			sprite.color = Color.YELLOW;
		}
	}

	highLightSwitch(): void {
		const sprite = this.getComponent(Sprite);
		if (sprite) {
			sprite.color = Color.RED;
		}
	}
}
