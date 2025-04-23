import { _decorator, Component, EventKeyboard, game, Input, input, KeyCode, macro, Node, profiler } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartUpGeneric')
export class StartUpGeneric extends Component {
	start() {
		macro.ENABLE_WEBGL_ANTIALIAS = false;
		profiler.hideStats();
		input.on(Input.EventType.KEY_UP, this.onEscButton, this);
	}
	onEscButton(event: EventKeyboard) {
		if (event.keyCode === KeyCode.ESCAPE) {
			game.restart();
		}
	}

	update(deltaTime: number) {}
}
