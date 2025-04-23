import { _decorator, Component, Input, input, Node } from 'cc';
import { sceneManager } from '../scene/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('ResumeBtn')
export class ResumeBtn extends Component {
	start() {
		this.node.on(Input.EventType.MOUSE_UP, this.onClicked, this);
	}

	onClicked() {
		sceneManager.resume();
	}

	update(deltaTime: number) {}
}
