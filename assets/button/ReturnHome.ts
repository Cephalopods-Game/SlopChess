import {
	_decorator,
	Camera,
	Color,
	Component,
	director,
	Input,
	instantiate,
	Node,
	Prefab,
	resources,
	Sprite,
	SpriteFrame,
} from 'cc';
import { sceneManager } from '../scene/SceneManager';
import { Player } from '../Player';
import { Tile } from '../Tile';
import { Piece, SpriteFrameUrl } from '../Piece';
const { ccclass, property } = _decorator;

@ccclass('ReturnHome')
export class ReturnHome extends Component {
	@property(Prefab)
	tile: Prefab | null = null;

	listPlayers(players: Player[], losers: Player[]) {
		const total = players.length + losers.length;
		const pos = total == 4 ? [-125 - 250, -125, 125, 125 + 250] : [-123, 125];
		for (const p of players) {
			const t = instantiate(this.tile);
			this.node.getParent().addChild(t);
			t.setPosition(pos.pop(), 0, 0);
			t.getComponent(Sprite).color = Color.TRANSPARENT;
			t.getComponentInChildren(Sprite).color = p.color.clone();
			resources.load(SpriteFrameUrl.k, SpriteFrame, (err, spriteFrame) => {
				if (err) {
					console.error('Error loading sprite frame:', err);
					return;
				}
				const sprite = this.getComponentInChildren(Sprite);
				if (sprite) {
					sprite.spriteFrame = spriteFrame;
				}
			});
		}
		for (const p of losers) {
			const t = instantiate(this.tile);
			this.node.getParent().addChild(t);
			t.setPosition(pos.pop(), 0, 0);
			t.getComponent(Sprite).color = Color.TRANSPARENT;
			t.getComponentInChildren(Sprite).color = p.color.clone();
			resources.load(SpriteFrameUrl['p'], SpriteFrame, (err, spriteFrame) => {
				if (err) {
					console.error('Error loading sprite frame:', err);
					return;
				}
				const sprite = this.getComponentInChildren(Sprite);
				if (sprite) {
					sprite.spriteFrame = spriteFrame;
				}
			});
		}
	}

	start() {
		this.node.on(Input.EventType.MOUSE_UP, this.onClicked, this);
	}

	onClicked() {
		sceneManager.backToMainMenu();
	}

	update(deltaTime: number) {}
}
