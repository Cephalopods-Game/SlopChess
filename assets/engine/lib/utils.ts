import { COLUMNS, ROWS, COLORS, PIECES } from './const/board';

export function printToConsole(configuration) {
	console.log('\n');
	let fieldColor = COLORS.WHITE;
	Object.assign([], ROWS)
		.reverse()
		.map((row) => {
			console.log(`${row}`);
			COLUMNS.map((column) => {
				switch (configuration.pieces[`${column}${row}`]) {
					case 'K':
						console.log('\u265A');
						break;
					case 'Q':
						console.log('\u265B');
						break;
					case 'R':
						console.log('\u265C');
						break;
					case 'B':
						console.log('\u265D');
						break;
					case 'N':
						console.log('\u265E');
						break;
					case 'P':
						console.log('\u265F');
						break;
					case 'k':
						console.log('\u2654');
						break;
					case 'q':
						console.log('\u2655');
						break;
					case 'r':
						console.log('\u2656');
						break;
					case 'b':
						console.log('\u2657');
						break;
					case 'n':
						console.log('\u2658');
						break;
					case 'p':
						console.log('\u2659');
						break;
					default:
						console.log(fieldColor === COLORS.WHITE ? '\u2588' : '\u2591');
				}

				fieldColor = fieldColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
			});
			fieldColor = fieldColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
			console.log('\n');
		});
	console.log(' ');
	COLUMNS.map((column) => {
		console.log(`${column}`);
	});
	console.log('\n');
}

export function getPieceValue(piece) {
	const values = { k: 10, q: 9, r: 5, b: 3, n: 3, p: 1 };
	return values[piece.toLowerCase()] || 0;
}

export function getFEN(configuration) {
	let fen = '';
	Object.assign([], ROWS)
		.reverse()
		.map((row) => {
			let emptyFields = 0;
			if (row < 8) {
				fen += '/';
			}
			COLUMNS.map((column) => {
				const piece = configuration.pieces[`${column}${row}`];
				if (piece) {
					if (emptyFields) {
						fen += emptyFields.toString();
						emptyFields = 0;
					}
					fen += piece;
				} else {
					emptyFields++;
				}
			});
			fen += `${emptyFields || ''}`;
		});

	fen += configuration.turn === COLORS.WHITE ? ' w ' : ' b ';

	const { whiteShort, whiteLong, blackLong, blackShort } = configuration.castling;
	if (!whiteLong && !whiteShort && !blackLong && !blackShort) {
		fen += '-';
	} else {
		if (whiteShort) fen += 'K';
		if (whiteLong) fen += 'Q';
		if (blackShort) fen += 'k';
		if (blackLong) fen += 'q';
	}

	fen += ` ${configuration.enPassant ? configuration.enPassant.toLowerCase() : '-'}`;

	fen += ` ${configuration.halfMove}`;

	fen += ` ${configuration.fullMove}`;

	return fen;
}

export function getJSONfromFEN(fen = '') {
	const [board, player, castlings, enPassant, halfmove, fullmove] = fen.split(' ');

	// pieces
	const configuration = {
		pieces: Object.fromEntries(
			board.split('/').flatMap((row, rowIdx) => {
				let colIdx = 0;
				return row.split('').reduce((acc, sign) => {
					const piece = sign.match(/k|b|q|n|p|r/i);
					if (piece) {
						// @ts-ignore
						acc.push([`${COLUMNS[colIdx]}${ROWS[7 - rowIdx]}`, piece[0]]);
						colIdx += 1;
					}
					const squares = sign.match(/[1-8]/);
					if (squares) {
						colIdx += Number(squares);
					}
					return acc;
				}, []);
			})
		),
	};

	// playing player
	if (player === 'b') {
		// @ts-ignore
		configuration.turn = COLORS.BLACK;
	} else {
		// @ts-ignore
		configuration.turn = COLORS.WHITE;
	}

	// castlings
	// @ts-ignore
	configuration.castling = {
		whiteLong: false,
		whiteShort: false,
		blackLong: false,
		blackShort: false,
	};
	if (castlings.includes('K')) {
		// @ts-ignore
		configuration.castling.whiteShort = true;
	}
	if (castlings.includes('k')) {
		// @ts-ignore
		configuration.castling.blackShort = true;
	}
	if (castlings.includes('Q')) {
		// @ts-ignore
		configuration.castling.whiteLong = true;
	}
	if (castlings.includes('q')) {
		// @ts-ignore
		configuration.castling.blackLong = true;
	}

	// enPassant
	if (isLocationValid(enPassant)) {
		// @ts-ignore
		configuration.enPassant = enPassant.toUpperCase();
	}

	// halfmoves
	// @ts-ignore
	configuration.halfMove = parseInt(halfmove);

	// fullmoves
	// @ts-ignore
	configuration.fullMove = parseInt(fullmove);

	return configuration;
}

export function isLocationValid(location) {
	return typeof location === 'string' && location.match('^[a-hA-H]{1}[1-8]{1}$');
}

export function isPieceValid(piece) {
	return Object.values(PIECES).includes(piece);
}
