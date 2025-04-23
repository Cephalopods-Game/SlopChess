import { _decorator, Component, Camera, EventMouse, input, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraZoom')
export class CameraZoom extends Component {
	@property(Camera)
	camera!: Camera;

	minZoom: number = 50;
	maxZoom: number = 1000;
	zoomSpeed: number = 20;

	onLoad() {
		input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
	}

	onDestroy() {
		input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
	}

	onMouseWheel(event: EventMouse) {
		if (!this.camera) return;

		// Increase or decrease orthoHeight for zooming
		const delta = event.getScrollY() * this.zoomSpeed * 0.01;
		let newHeight = this.camera.orthoHeight + delta;

		newHeight = Math.max(this.minZoom, Math.min(this.maxZoom, newHeight));
		this.camera.orthoHeight = newHeight;
	}
}
