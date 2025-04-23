import { _decorator, Color, Component, Input, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;
import { Room } from './RoomCfg';

@ccclass('Mul')
export class Mul extends Component {
	start() {
		if (Room.mul) this.getComponent(Sprite).color = Color.GREEN;
		else this.getComponent(Sprite).color = Color.WHITE;
		this.node.on(Input.EventType.MOUSE_UP, this.onClicked, this);
	}

	onClicked() {
		Room.switchMul();
		if (Room.mul) this.getComponent(Sprite).color = Color.GREEN;
		else this.getComponent(Sprite).color = Color.WHITE;
	}

	update(deltaTime: number) {}
}
