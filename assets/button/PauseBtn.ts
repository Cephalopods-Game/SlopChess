import { _decorator, Component, Input, Node } from 'cc';
import { sceneManager } from '../scene/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('PauseBtn')
export class PauseBtn extends Component {
	start() {
		this.node.on(Input.EventType.MOUSE_UP, this.onClicked, this);
	}

	onClicked() {
		sceneManager.pauseToMain();
	}

	update(deltaTime: number) {}
}
