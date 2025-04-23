import { _decorator, Component, input, Input, EventMouse, Vec2, Vec3, Camera } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraDrag')
export class CameraDrag extends Component {
	private isDragging = false;
	private lastMousePos = new Vec2();

	start() {
		input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
		input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
		input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
	}

	onDestroy() {
		input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
		input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
		input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
	}

	private onMouseDown(event: EventMouse) {
		if (event.getButton() === EventMouse.BUTTON_LEFT) {
			this.isDragging = true;
			this.lastMousePos.set(event.getLocationX(), event.getLocationY());
		}
	}

	private onMouseMove(event: EventMouse) {
		if (!this.isDragging) return;

		const currentMousePos = new Vec2(event.getLocationX(), event.getLocationY());
		const delta = currentMousePos.subtract(this.lastMousePos);

		const cameraNode = this.node;
		const currentPos = cameraNode.getPosition();
		cameraNode.setPosition(new Vec3(currentPos.x - delta.x, currentPos.y + delta.y, currentPos.z));

		this.lastMousePos.set(currentMousePos);
	}

	private onMouseUp(event: EventMouse) {
		if (event.getButton() === EventMouse.BUTTON_LEFT) {
			this.isDragging = false;
		}
	}
}
