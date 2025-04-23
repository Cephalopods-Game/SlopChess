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

	start(): void {
		this.node.on(Input.EventType.MOUSE_UP, this.onTileClicked, this);

		custEventTarget.onNextTurn(() => {
			if (!this.color.equals(Color.YELLOW)) {
				this.glowSwitch();
			}
			if (!this.highLight.equals(Color.RED)) {
				this.highLightSwitch();
			}
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
			const c = sprite.color.clone();
			sprite.color = this.color.clone();
			this.color = c;
		}
	}

	highLightSwitch(): void {
		const sprite = this.getComponent(Sprite);
		if (sprite) {
			const c = sprite.color.clone();
			sprite.color = this.highLight.clone();
			this.highLight = c;
		}
	}
}
