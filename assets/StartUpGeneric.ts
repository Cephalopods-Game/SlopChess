import { _decorator, Component, macro, Node, profiler } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartUpGeneric')
export class StartUpGeneric extends Component {
	start() {
		macro.ENABLE_WEBGL_ANTIALIAS = false;
		profiler.hideStats();
	}

	update(deltaTime: number) {}
}
