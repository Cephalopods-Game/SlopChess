import { _decorator, Component, Input, Label, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Room } from './RoomCfg';

@ccclass('Lvl')
export class Lvl extends Component {
	start() {
		this.node.getComponentInChildren(Label).string = this.lvlToText(Room.level);
		this.node.on(Input.EventType.MOUSE_UP, this.onClicked, this);
	}

	lvlToText(lvl: number) {
		const currLvl = lvl;
		let text: string;
		if (currLvl == 1) text = 'Easy AI';
		else if (currLvl == 2) text = 'Intermediate AI';
		else if (currLvl == 3) text = 'Advanced AI';
		return text;
	}

	onClicked() {
		Room.increaseLevel();
		this.node.getComponentInChildren(Label).string = this.lvlToText(Room.level);
	}

	update(deltaTime: number) {}
}
