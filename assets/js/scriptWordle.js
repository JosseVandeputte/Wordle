"use strict";

// Global variables
let wordOfTheDay = "";
let counterOfClickedLetters = 0;
let arrayOfLetters = new Array(5).fill("");
let counterOfTries = 0;
let currentRow = "";

document.addEventListener("DOMContentLoaded", initWordle);

async function getWordsOf5() {
    const response = await fetch('https://api.datamuse.com/words?sp=?????');
    const data = await response.json();
    return data.map(item => item.word).filter(word => word.length === 5);
}

async function getWordOfTheDay() {
    const wordsOf5 = await getWordsOf5();
    return wordsOf5[Math.floor(Math.random() * wordsOf5.length)];
}

async function initWordle() {
    //get words of 5 letters
    wordOfTheDay = await getWordOfTheDay();
    
    //show information
    showInformation();

    //keyboard input
    setupKeyboardListeners();

}

function showInformation() {
    let idInformation = document.querySelector("#information");
    let idBtn = document.querySelector("#help");
    let close = document.querySelector(".close");

    idBtn.onclick = function() {
        idInformation.style.display = "block";
    }

    close.onclick = function() {
        idInformation.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == idInformation) {
            idInformation.style.display = "none";
        }
    }
}

function setupKeyboardListeners() {
    document.querySelectorAll('.keyboard_letters').forEach(button => {
        button.addEventListener('click', buttonClickHandler);
    });

    document.addEventListener('keydown', function(e) {
        // Get the pressed key
        let key = e.key.toLowerCase();

        // Special case for the delete key
        if (e.key === 'Backspace') {
            key = 'delete';
        }
        // Find the corresponding button in the HTML keyboard
        let button = document.querySelector(`.keyboard_letters[data-key="${key}"]`);

        // If the button exists, simulate a click on it
        if (button) {
            button.click();
        }
    });
}


function buttonClickHandler(e) {
    //add letters to array
    if(counterOfClickedLetters < 5 && e.target.dataset.key !== "delete" && e.target.dataset.key !== "enter") {
        arrayOfLetters[counterOfClickedLetters] = e.target.dataset.key;
        counterOfClickedLetters++;
        displayLetters();
    }

    //delete letters from array
    if(e.target.dataset.key === "delete") {
        arrayOfLetters[counterOfClickedLetters - 1] = "";
        counterOfClickedLetters--;
        displayLetters();
    }

    //check word
    if(e.target.dataset.key === "enter") {
        if(counterOfClickedLetters === 5) {
            counterOfTries++;
            checkWord();
        }
    }
}

function displayLetters() {
    currentRow = document.querySelector(`#Row${counterOfTries + 1}`);
    for (let i = 0; i < 5; i++) {
        currentRow.children[i].textContent = arrayOfLetters[i];
    }
}

function checkWord() {
    let correctLetters = 0;
    for (let i = 0; i < 5; i++) {
        let currentLetterBoard = document.querySelector(`.board_letters#Row${counterOfTries}[data-key="${i+1}"]`); 
        let currentLetterKeyboard = document.querySelector(`.keyboard_letters[data-key="${arrayOfLetters[i]}"]`);   
        if(arrayOfLetters[i] === wordOfTheDay[i]) {
            //check if letters are in correct place
            currentLetterBoard.classList.add("board_letters_correctPlace");
            correctLetters++;
            //show in keyboard that letter is in correct place
            currentLetterKeyboard.classList.add("keyboard_letters_correctPlace");

        } else if(wordOfTheDay.includes(arrayOfLetters[i]) && arrayOfLetters[i] !== wordOfTheDay[i]) { 
            //check if letters are in word but not in correct place
            currentLetterBoard.classList.add("board_letters_wrongPlace");
            //show in keyboard that letter is in word but not in correct place
            currentLetterKeyboard.classList.add("keyboard_letters_wrongPlace");
        } else {
            //check if letters are not in word
            currentLetterBoard.classList.add("board_letters_wrongLetter");
            //show in keyboard that letter is wrong
            currentLetterKeyboard.classList.add("keyboard_letters_wrongLetter");
        }

        if(correctLetters === 5){
            let buttons = document.querySelectorAll('.keyboard_letters');
        
            buttons.forEach((button) => {
                button.removeEventListener('click', buttonClickHandler);
                button.style.transition = "none";
                button.classList.remove("keyboard_letters_hover");
                button.style.cursor = "default";
            });
            showEndGame(true, wordOfTheDay);
        }
    }
    arrayOfLetters.length = 0;
    counterOfClickedLetters = 0;
}

function showEndGame(isWordGuessed, word) {
    let endGame = document.querySelector("#endGame");
    let endGameMessage = document.querySelector("#endGameMessage");
    let playAgain = document.querySelector("#playAgain");
    let closeEnd = document.querySelector("#closeEnd");

    closeEnd.onclick = function() {
        endGame.style.display = "none";
    }

    if (isWordGuessed) {
        endGameMessage.textContent = "Congratulations! You guessed the word correctly!";
    } else {
        endGameMessage.textContent = "Sorry, you didn't guess the word. The correct word was " + word + ".";
    }

    endGame.style.display = "block";

    playAgain.onclick = function() {
        endGame.style.display = "none";
        resetGame();
    }
}

function resetGame() {
    location.reload();
}

// function isWordInDictionary(word) {
//     return fetch(`https://api.datamuse.com/words?sp=${word}`)
//         .then(response => response.json())
//         .then(data => data.some(item => item.word === word));
// //https://rapidapi.com/azizbergach/api/wordle-game-api1
// }