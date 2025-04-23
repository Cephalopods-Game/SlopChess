import { _decorator, Component, Input, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Room } from './RoomCfg';
import { sceneManager } from '../scene/SceneManager';

@ccclass('JoinRoom')
export class JoinRoom extends Component {
	start() {
		this.node.on(Input.EventType.MOUSE_UP, this.onClicked, this);
	}

	onClicked() {
		sceneManager.joinRoom();
	}

	update(deltaTime: number) {}
}
