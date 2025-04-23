import { _decorator, Component, Input, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Room } from './RoomCfg';
import { sceneManager } from '../scene/SceneManager';

@ccclass('CreateRoom')
export class CreateRoom extends Component {
	start() {
		this.node.on(Input.EventType.MOUSE_UP, this.onClicked, this);
	}

	onClicked() {
		sceneManager.createRoom(Room.name, 0, { '4p': Room.mul, rand: Room.rand, level: Room.level });
	}

	update(deltaTime: number) {}
}
