function generateBoard(rows, cols, fill = null) {
	// Create data array
	const data = new Array(rows*cols);
	data.fill(fill);
	// Create object to return
	const object = {
		data: data,
		rows: rows,
		cols: cols
	};
	return object
} 

function rowColToIndex(board, row, col) { 
	return(board.cols * row + col);
} 

function indexToRowCol(board, i) { 
	const row = Math.floor(i/board.cols);
	const col = i % board.cols;
	// Create object to return
	const object = {
		row: row,
		col: col
	};
	return object;
} 

function setCell(board, row, col, value) { 
	// Copy the array and clone via spread operator
	const newBoard = [...board.data];
	// Modify board
	const index = rowColToIndex(board, row, col);
	newBoard[index] = value;
	// Create object to return
	const object = {
		data: newBoard,
		rows: board.rows,
		cols: board.cols
	};
	return object;
} 

function setCells(board, ...anyNumberOfMoveObjects) { 
	let newData = board;
	// Lop over the args with the above function
	for (let i = 0; i < anyNumberOfMoveObjects.length; i++) {
		const move = anyNumberOfMoveObjects[i];
		newData = setCell(newData, move.row, move.col, move.val);
	}
	return newData;
}

// Helper for boardToString
function symbolAdd(string, symbol, widest) {
	const wcwidth = require('wcwidth');
	let newString = string.slice(0);
	newString = newString.concat("| ");
	newString = newString.concat(symbol);
	if (wcwidth(symbol) < widest) {
		const spacer = widest - wcwidth(symbol);
		for (let i = 1; i <= spacer; i++) {
			newString = newString.concat(" "); 
		}
	}
	newString = newString.concat(" ");
	return newString;
}

// Helper for boardToString
function labelAdd (string, col, widest) {
	// Copy the input string
	let newString = string.slice(0);
	// Add the bars, plusses and dashes
	newString = newString.concat("|");
	for (let i = 0; i < col; i++){
		// Left and center plus
		newString = newString.concat("--");
		// Extra plusses (As needed)
		for (let j = 2; j <= widest; j++) {
			newString = newString.concat("-"); 
		}
		// If not last, use +, otherwise skip it.
		if (i + 1 < col) {
			newString = newString.concat("-+"); 
		}
		else {
			newString = newString.concat("-"); 
		}
	}
	newString = newString.concat("|\n|");
	// Add the letters now
	for (let i = 0; i < col; i++){
		// Left space
		newString = newString.concat(" ");
		// Letter
		const letterId = i + 65;
		newString = newString.concat(String.fromCharCode(letterId));
		// Extra Spaces (As needed)
		for (let j = 2; j <= widest; j++) {
			newString = newString.concat(" "); 
		}
		newString = newString.concat(" |"); 
	}
	return newString;
}

function boardToString(board) { 
	const wcwidth = require('wcwidth');
	// Get the widest size.
	let widest = 0;
	for (const values of board.data) {
		if (values !== null) {
			const thisWidth = wcwidth(values);
			if (thisWidth > widest) {
				widest = thisWidth;
			}
		}
	}
	let string = "";
	// Per row
	for (let i = 0; i < board.rows; i++) {
		// Per col
		for (let j = 0; j < board.cols; j++) {
			let symbol = board.data[rowColToIndex(board, i, j)];
			if (symbol === null) {
				symbol = " ";
			}
			string = symbolAdd(string, symbol, widest);
		}
		string = string.concat("|\n");
	}
	string = labelAdd(string, board.cols, widest);
	return string;
}

function letterToCol(letter) { 
	const letterCode = letter.charCodeAt(0);
	if (letterCode > 64 && letterCode < 91 && letter.length === 1) {
		return (letterCode - 65);
	}
	return null;
}

// Helper for getEmptyRowCol
function colCheck(board, col, row, empty) {
	// index of array is row number
	for (let i = row; i >= 0; i--){
		if (board.data[rowColToIndex(board, i, col)] !== empty) {
			return false;
		}
	}
	return true;
}

function getEmptyRowCol (board, letter, empty = null) {
	// Check validity
	const boardCol = letterToCol(letter);
	if (boardCol === null || boardCol > (board.cols - 1)) {
		return null;
	}

	// Check the array
	for (let j = board.rows-1; j >= 0; j-- ) {
		if (board.data[rowColToIndex(board, j, boardCol)] === empty && colCheck(board, boardCol, j, empty)){
			return {
				row: j,
				col: boardCol
			};
		}
	}
	return null;
}

function getAvailableColumns(board, empty = null) { 
	const letters = [];
	// Per col
	for (let i = 0; i < board.cols; i++) {
		const letterId = i + 65;
		const letter = String.fromCharCode(letterId);
		if (getEmptyRowCol(board, letter, empty) !== null) {
			letters.push(letter);
		}
	}
	return letters;
}

function hasConsecutiveValues(board, row, col, n) { 
	const winSymbol = board.data[rowColToIndex(board, row, col)];
	// Vertical test
	let countedVertical = 0;
	// Go up (decreasing row) part
	for (let i = row; i >= 0; i--) {
		if (board.data[rowColToIndex(board, i, col)] === winSymbol) {
			countedVertical++;
		}
		else {
			break;
		}
	}
	// Go down (increasing row) part
	for (let i = row + 1; i < board.rows; i++) {
		if (board.data[rowColToIndex(board, i, col)] === winSymbol) {
			countedVertical++;
		}
		else {
			break;
		}
	}
	// Vertical Win
	if (countedVertical >= n) {
		return true;
	}
	
	// Horizontal test
	let countedHorizontal = 0;
	// Go left (decreasing col) part
	for (let i = col; i >= 0; i--) {
		if (board.data[rowColToIndex(board, row, i)] === winSymbol) {
			countedHorizontal++;
		}
		else {
			break;
		}
	}
	// Go right (increasing col) part
	for (let i = col + 1; i < board.cols; i++) {
		if (board.data[rowColToIndex(board, row, i)] === winSymbol) {
			countedHorizontal++;
		}
		else {
			break;
		}
	}
	// Horizontal Win
	if (countedHorizontal >= n) {
		return true;
	}

	// Diagonal Test 1 (LL (high row, low col) to UR (low row, high col)) 
	let countedDiag1 = 0;
	// Go to lower left (increasing row, decreasing col) part
	for (let i = row, j = col; i < board.rows && j >= 0; i++, j--) {
		if (board.data[rowColToIndex(board, i, j)] === winSymbol) {
			countedDiag1++;
		}
		else {
			break;
		}
	}
	// Go to upper right (decreasing row, increasing col) part
	for (let i = row - 1, j = col + 1; i >= 0 && j < board.cols; i--, j++) {
		if (board.data[rowColToIndex(board, i, j)] === winSymbol) {
			countedDiag1++;
		}
		else {
			break;
		}
	}
	// Diag1 Win
	if (countedDiag1 >= n) {
		return true;
	}

	// Diagonal Test 2 (LR (high row, high col) to UL (low row, low col)) 
	let countedDiag2 = 0;
	// Go to lower right (increasing row, increasing col) part
	for (let i = row, j = col; i < board.rows && j < board.cols; i++, j++) {
		if (board.data[rowColToIndex(board, i, j)] === winSymbol) {
			countedDiag2++;
		}
		else {
			break;
		}
	}
	// Go to upper left (decreasing row, decreasing col) part
	for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
		if (board.data[rowColToIndex(board, i, j)] === winSymbol) {
			countedDiag2++;
		}
		else {
			break;
		}
	}
	// Diag1 Win
	if (countedDiag2 >= n) {
		return true;
	}

	// Else there is no win condition met.
	return false;
}

function autoplay(board, s, numConsecutive) { 
	// Get the pieces
	const pieces = [];
	let lastPieceMoved = null;
	let earlyWin = false;

	// Slice Array
	const sArray = [...s];
	// Get the pieces
	pieces.push(sArray[0]);
	pieces.push(sArray[1]);

	// Fill in the board
	for (let i = 2; i < sArray.length; i++) {
		lastPieceMoved = pieces[i%2];
		// See if move is valid
		const moveLoc = getEmptyRowCol(board, sArray[i]);
		// Valid Move
		if (moveLoc !== null & !earlyWin) {
			// Place and Check
			board = setCell(board, moveLoc.row, moveLoc.col, pieces[i%2]);
			
			if (hasConsecutiveValues(board, moveLoc.row, moveLoc.col, numConsecutive) === true) {
				earlyWin = true;
				if (i + 1 === sArray.length) {
					return {
						board: board,
						pieces: pieces,
						winner: pieces[i%2],
						lastPieceMoved: lastPieceMoved
					};
				}
			}
		}
		// Invalid Move
		else {
			return {
				board: null,
				pieces: pieces,
				lastPieceMoved: lastPieceMoved,
				error: {
					col: sArray[i],
					num: i - 1,
					val: lastPieceMoved
				}
			};
		}
		
		
	}
	// No moves case!
	return {
		board: board,
		pieces: pieces,
		lastPieceMoved: lastPieceMoved
	};
}

module.exports = {
	generateBoard: generateBoard,
	rowColToIndex: rowColToIndex,
	indexToRowCol: indexToRowCol,
	setCell: setCell,
	setCells: setCells,
	boardToString: boardToString,
	letterToCol: letterToCol,
	getEmptyRowCol: getEmptyRowCol,
	getAvailableColumns: getAvailableColumns,
	hasConsecutiveValues: hasConsecutiveValues,
	autoplay: autoplay
};