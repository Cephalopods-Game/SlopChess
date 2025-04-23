import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RoomCfg')
class RoomCfg extends Component {
	room: string = 'default';
	mul: boolean = false;
	rand: boolean = false;
	level: number = 2;

	switchMul() {
		this.mul = !this.mul;
	}

	switchRand() {
		this.rand = !this.rand;
	}

	increaseLevel() {
		this.level = (this.level % 3) + 1; // 1, 2, 3
	}

	createRoom(options: { mul: boolean; rand: boolean; level: number }) {
		this.mul = options.mul;
		this.rand = options.rand;
		this.level = options.level;
	}
}

export const Room = new RoomCfg();
