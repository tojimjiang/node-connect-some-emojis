// Require connectmoji + modules
const c = require('./connectmoji.js');
const readlineSync = require('readline-sync');
const clear = require('clear');

// Get the arguments
let arg = process.argv[2];
let inputLoop = true;
let answer;
let answer3;
let symArray;

if (process.argv.length === 2) {
    // No CLI arguments passed in.
    while (inputLoop) {
        // Get Row, Col, and Cons
        answer = readlineSync.question('Enter the number of rows, columns, and consecutive "pieces" for win\n(all seperated by commas... for example: "$<defaultInput>")\n',
            { defaultInput: '6, 7, 4' });
        // Split into array
        answer = answer.replace(/\s+/g, '');
        const rowColCons = answer.split(",");
        if (rowColCons.length === 3) {
            // Recombine to make a space delineated string
            let outString = "";
            for (let i = 0; i < rowColCons.length; i++) {
                outString = outString.concat(rowColCons[i]);
                if (i !== 2) {
                    outString = outString.concat(" ");
                }
            }
            // Log to console
            console.log("Using row, col and consecutive: " + outString);
            // Spacing
            console.log();
            inputLoop = false;
            // Break
            break;
        }
        else {
            // Incorrect 
            console.log("Oops, that is not a valid input, try again!");
        }
    }
    // Reset input loop condition
    inputLoop = true;

    while (inputLoop) {
        // Get Icons/Symbols
        let answer2 = readlineSync.question('Enter two characters that represent the player and computer\n(separated by a comma... for example: P,C)\n',
            { defaultInput: '😎,💻' });

        // Split into array
        answer2 = answer2.replace(/\s+/g, '');
        symArray = answer2.split(",");
        // Recombine to make a space delineated string
        let outString2 = "";
        for (let i = 0; i < symArray.length; i++) {
            outString2 = outString2.concat(symArray[i]);
            if (i === 0) {
                outString2 = outString2.concat(" ");
            }
        }

        if (symArray.length === 2) {
            // Log to console
            if (answer2 === '😎,💻') {
                console.log("Using default player and computer characters: " + outString2);
            }
            else {
                console.log("Using player and computer characters: " + outString2);
            }
            // Spacing
            console.log();
            break;
        }

        else {
            // Incorrect 
            console.log("Oops, that is not a valid input, try again!");
        }

    }

    // Get first mover
    answer3 = readlineSync.question('Who goes first, (P)layer or (C)omputer?\n',
        { defaultInput: 'P' }).toUpperCase();

    // Check validity and log to console (and make the arg string)
    if (answer3 === 'P') {
        console.log("Player goes first");
        arg = symArray[0] + ',' + symArray[0] + symArray[1] + ',' + answer;
    }
    else if (answer3 === 'C') {
        console.log("Computer goes first");
        arg = symArray[0] + ',' + symArray[1] + symArray[0] + ',' + answer;
    }
    else {
        answer3 = 'P';
        console.log("Player goes first");
        arg = symArray[0] + ',' + symArray[0] + symArray[1] + ',' + answer;
    }
}
// Enter to start
readlineSync.question("Press <ENTER> to start game");

// Create args as array
const argArray = arg.split(",");
// Generate Board from array
let board = c.generateBoard(argArray[2], argArray[3]);
// Autoplay based on array
const autoplay = c.autoplay(board, argArray[1], argArray[4]);
board = autoplay.board;

// Clear before output!
clear();

// Error case
if (board === null) {
    // Autoplay gave an error (exit)
    console.log("There was an error in auto-play. Please check your moves are valid.");
    console.log();
    console.log("--- ERROR DETAIL ---");
    console.log("Offending move was:");
    console.log(autoplay.error);
    process.exit(1);
}

// Otherwise display board first
console.log(c.boardToString(board));
// spacer
console.log();

// Detect if there was a instant winner (and exit)
if (autoplay.winner !== undefined) {
    console.log("Winner is " + autoplay.winner);
    process.exit(0);
}

// Continue the game
let prevPlayerObj;
let first;
let second;
if (autoplay.lastPieceMoved === null) {
    // Autoplay with no moves
    // Get the second piece, as the next move is the first move, and
    // the first move is at index 0 in the pieces array.
    if (answer3 === 'P') {
        first = {
            role: "P",
            value: autoplay.pieces[0]
        };
        second = {
            role: "C",
            value: autoplay.pieces[1]
        };
    }
    else {
        first = {
            role: "C",
            value: autoplay.pieces[0]
        };
        second = {
            role: "P",
            value: autoplay.pieces[1]
        };
    }
}
else {
    // Autoplay with moves
    // Get the pieces Slice Array
    const sArray = [...argArray[1]];
    // Get the size to determine first/second GOING FORWARD
    if (sArray.length % 2 === 0) {
        // No remainder (even)
        // first is the first piece
        if (sArray[0] === argArray[0]) {
            // First was player
            first = {
                role: "P",
                value: autoplay.pieces[0]
            };
            second = {
                role: "C",
                value: autoplay.pieces[1]
            };
        }
        else {
            // First was computer
            first = {
                role: "C",
                value: autoplay.pieces[0]
            };
            second = {
                role: "P",
                value: autoplay.pieces[1]
            };
        }
    }
    // Remainder 1 (uneven)
    // first to go is the SECOND piece
    // second to go is the FIRST piece
    else if (sArray[0] === argArray[0]) {
        // First (in autoplay) was player
        // Leaving autoplay, first is C
        first = {
            role: "C",
            value: autoplay.pieces[1]
        };
        second = {
            role: "P",
            value: autoplay.pieces[0]
        };
    }
    else {
        // First (in autoplay) was computer
        // Leaving autoplay, first is P
        first = {
            role: "P",
            value: autoplay.pieces[1]
        };
        second = {
            role: "C",
            value: autoplay.pieces[0]
        };
    }
}

// Define the theoretical previous player at game start
prevPlayerObj = second;

let gameGo = true;
while (gameGo) {
    // Make sure board is not in a tied condition
    const validMoves = c.getAvailableColumns(board);
    if (validMoves.length === 0) {
        // Tied
        console.log();
        console.log("No winner. So sad 😭");
        gameGo = false;
        break;
    }
    // Loop wide definitions
    let inputCheck;
    let answerCol;
    // P1 just moved
    if (prevPlayerObj === first) {
        // P2 now goes.
        if (second.role === "P") {
            // Human
            // Check the input
            inputCheck = true;
            while (inputCheck) {
                answerCol = readlineSync.question("Choose a column letter to drop your piece in\n").toUpperCase();
                if (validMoves.includes(answerCol)) {
                    // Valid move
                    break;
                }
                else {
                    // Invalid Column
                    console.log("Oops! that is not a valid move, try again!");
                }
            }

        }
        else {
            // Computer
            // Randomly generate move to pick.
            answerCol = validMoves[Math.floor(Math.random() * validMoves.length)];
            // Wait for user via prompt
            readlineSync.question("Press <ENTER> to see computer move");
        }
        prevPlayerObj = second;
    }
    // P2 just moved
    else {
        // P1 now goes.
        if (first.role === "P") {
            // Human
            // Check the input
            inputCheck = true;
            while (inputCheck) {
                answerCol = readlineSync.question("Choose a column letter to drop your piece in\n").toUpperCase();
                if (validMoves.includes(answerCol)) {
                    // Valid move
                    break;
                }
                else {
                    // Invalid Column
                    console.log("Oops! that is not a valid move, try again!");
                }
            }

        }
        else {
            // Computer
            // Randomly generate move to pick.
            answerCol = validMoves[Math.floor(Math.random() * validMoves.length)];
            // Wait for user via prompt
            readlineSync.question("Press <ENTER> to see computer move");
        }
        prevPlayerObj = first;
    }
    // Move approved. Perform that move
    const moveLoc = c.getEmptyRowCol(board, answerCol);
    // Since next move player order has changed on move input,  when drawing the board use the prevPlayer
    board = c.setCell(board, moveLoc.row, moveLoc.col, prevPlayerObj.value);
    // Clear and Print
    clear();
    console.log("...dropping in column " + answerCol);
    console.log(c.boardToString(board));
    console.log();

    // Check win condition
    if (c.hasConsecutiveValues(board, moveLoc.row, moveLoc.col, argArray[4])) {
        console.log("Winner is " + prevPlayerObj.value);
        gameGo = false;
        break;
    }
}
