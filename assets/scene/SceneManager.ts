import { _decorator, Component, director, Node } from 'cc';
import { Game } from '../Game';
import { Player } from '../Player';
import { ReturnHome } from '../button/ReturnHome';
const { ccclass, property } = _decorator;

@ccclass('SceneManager')
class SceneManager extends Component {
	start() {}

	update(deltaTime: number) {}

	createRoom(
		room: string,
		idx: number,
		options: { '4p': boolean; rand: boolean; level: number } = { '4p': false, rand: false, level: 2 }
	) {
		director.loadScene('game', (err, data) => {
			const sceneNode = director.getScene();
			const game = sceneNode.getComponentInChildren(Game);
			game.initGame(options, 0);
		});
	}

	joinRoom() {
		director.loadScene('game', (err, data) => {
			const sceneNode = director.getScene();
			const game = sceneNode.getComponentInChildren(Game);
			game.joinRoom('default');
		});
	}

	showResult(players: Player[], losers: Player[]) {
		director.loadScene('result', (err, data) => {
			const sceneNode = director.getScene();
			const stupidButton = sceneNode.getComponentInChildren(ReturnHome);
			stupidButton.listPlayers(players, losers);
		});
	}

	backToMainMenu() {
		director.loadScene('menu', (err, data) => {});
	}
}

export const sceneManager = new SceneManager();
