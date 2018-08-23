var cardValues = {
    "A": 0,
    "K": 1,
    "Q": 2,
    "J": 3,
    "10": 4,
    "9": 5,
    "8": 6,
    "7": 7,
    "6": 8,
    "5": 9,
    "4": 10,
    "3": 11,
    "2": 12
}

var lastFoundElement = undefined;

//Define the Card class
class Card {
    constructor(name) {
        this.name = name;
        this.value = cardValues[name];
    }
}

//Define the Deck class
class Deck {
    constructor() {
        this.cards = [];
        this.discardPile = [];
        
        for (var i = 0; i < 4; i++) {
            for (var key in cardValues) {
                var newCard = new Card(key);
                this.cards.push(newCard);
            }
        }
    }
    
    discard(card) {
        this.discardPile.push(card);
    }
    
    getCard(name) {
        name = name.toUpperCase();
        for (var i = 0; i < this.cards.length; i++) {
            var card = this.cards[i];
            if (card.name == name) {
                this.cards.splice(i, 1);
                this.discard(card);
                return card;
            }
        }
        
        return undefined;
    }
    
    filterCards(card, diff) {
        //Return an array with cards of higher, lower or same
        //value as the provided card.
        //Diff should be 0, positive or a negative number
        var result = []

        for (var i = 0; i < this.cards.length; i++) {
            var current_card = this.cards[i];
            if (diff > 0) {
                //Retrieve cards that have a higher value
                if (current_card.value >= card.value) {
                    //Card is lower
                    var current_card = undefined;
                }
            }
            else if (diff == 0) {
                //filter same value cards
                if (current_card.value != card.value) {
                    //Card is not the same
                    var current_card = undefined;
                }
            }
            else if (diff < 0) {
                //filter lower cards
                if (current_card.value <= card.value) {
                    //Card is higher
                    var current_card = undefined;
                }
            }
            
            if (current_card !== undefined) {
                result.push(current_card);
            }
        }
        
        return result;
    }
    
    calculateOdds(card) {
        //Calculate the probability of getting a higher or lower card
        //value 0 is higher than value 12
       
        //Get the number of cards above the current_card
        var higher = this.filterCards(card, 1);
       
        //Get the number of cards below the current_card
        var lower = this.filterCards(card, -1);
       
        //Same cards
        var same = this.filterCards(card, 0);
 
        var hChance = higher.length / this.cards.length;
        var lChance = lower.length / this.cards.length;
        var sChance = same.length / this.cards.length;
       
        console.log("Changes are:");
        console.log("  Higher: " + hChance.toString());
        console.log("  Lower: " + lChance.toString());
        console.log("  Same: " + sChance.toString());
    }
}

//Setup the deck
gameDeck = new Deck();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLoad(callback) {
    console.log(document.querySelector(".dealer-card.left"));
    while (document.querySelector(".dealer-card.left") == null) {
        console.log("Waiting for cards to be loaded");
        await sleep(2000);    
    }
    console.log("Cards loaded!");
    
    callback();
}

async function waitTime(callback, sleepTime) {
    await sleep(sleepTime);
    callback()
}

async function waitForElement(callback, selector, sleepTime, maxIterations) {
    console.log("Waiting for element " + selector);
    var found = false;
    var iterations = 0;
    sleepTime = sleepTime == undefined ? 2000 : sleepTime;
    maxIterations = maxIterations == undefined ? 10 : maxIterations;
    
    while (found == false && iterations < maxIterations) {
        if (document.querySelector(selector) != null) {
            found = true;
            break;
        } else {
            console.log("Sleeping");
            iterations += 1;
            await sleep(sleepTime);
        }
    }
    
    if (found == true) {
        console.log("Element found!");
        callback();
    } else {
        console.log("Element not found after " + maxIterations.toString() + " attempts");
    }
}

async function waitForCard(callback, side, remove) {
    var found = false;
    var cardFound = undefined;
    var findCallback = undefined;
    remove = remove == undefined ? false : remove;
    if (side == 0) {
        //Look in the dealer position
        console.log("Waiting for the left side card to load");
        findCallback = findLeftCard;
    } 
    else {
        //Look in the right position
        console.log("Waiting for the right side card to load");
        findCallback = findRightCard;
    }
    
    while (!found) {
        value = findCallback();
        
        if (value != -1) {
            console.log("Card found: " + value);
            found = true;
            if (remove) {
                //Remove the card from the deck
                gameDeck.getCard(value);
            }
        }
        console.log("Sleeping");
        await sleep(2000);    
    }
    
    callback();
}

function addListenerToElement(el, ev, callback) {
    console.log("Added listener on " + ev);
    el.addEventListener(ev, callback);
}

function startGame() {
    gameDeck = new Deck();
    waitTime(function() {
        waitForCard(readCards, 0, true);
    }, 1500);
}

function continueGame() {
    waitTime(function() {
        waitForCard(readCards, 0, true);
    }, 1500);
}

function clickLower() {
    waitTime(function() {
        waitForCard(readCards, 1, true);
    }, 1500);
}

function clickHigher() {
    waitTime(function() {
        waitForCard(readCards, 1, true);
    }, 1500);
}

function findLeftCard(updateLastFound) {
    console.log("Looking for Card 1");
    var dealerLeft = document.querySelector(".dealer-card.left");
    
    //Find the card amongst the children elements of the left position
    var cardLeftElement = findCard(dealerLeft, updateLastFound);
    
    var cardLeft = cardLeftElement.classList[0].replace("card-", "");
    var leftValue = cardLeft.split("-")[1];
    
    return leftValue;
}

function findRightCard() {
    console.log("Looking for Card 2");
    var yourCardRight = document.querySelector(".you-card.left");
    
    //Find the card amongst the children elements of the right position
    var cardRightElement = findCard(yourCardRight);
    
    if (cardRightElement != undefined) {
        var cardRight = cardRightElement.classList[0].replace("card-", "");
        var rightValue = cardRight.split("-")[1];
        
        return rightValue;
    } else {
        return -1;
    }
}

function findCard(el, setLastFound) {
    setLastFound = setLastFound == undefined ? false : setLastFound;
    
    if (setLastFound == false && lastFoundElement != undefined) {
        return lastFoundElement;
    }
    
    var cardFace1 = el.querySelector(".face1");
    var cardFace2 = el.querySelector(".face2");
    //See what element has the revealed card
    var suites=["diamonds", "clubs" ,"spades", "hearts"];

    var check1 = false;
    var i;
    for (i=0; i < suites.length; i++) {
        if (cardFace1.classList.value.includes(suites[i]) && cardFace1 != lastFoundElement) {
            check1 = true;
            break;
        }
    }
    var check2 = false;
    for (var i=0;i<suites.length;i++){
        if (cardFace2.classList.value.includes(suites[i]) && cardFace2 != lastFoundElement) {
            check2 = true;
            break;
        }
    }
    
    var returnElement = check1 == true ? cardFace1 : check2 == true ? cardFace2 : undefined;
    
    if (setLastFound) {
        lastFoundElement = returnElement;
    }
    
    return returnElement;
}

function readCards() {
    var startButton = document.querySelector(".action-btn-wrap.startGame");
    var lowerButton = document.querySelector(".action-btn-wrap.low");
    var higherButton = document.querySelector(".action-btn-wrap.high");
    var continueButton = document.querySelector(".action-btn-wrap.continue");
    
    var started = !(startButton != undefined && lowerButton.style.display != "inline-block" && higherButton.style.display != "inline-block");
    var inGame = continueButton.style.display == "inline-block";
    if (!started && !inGame) {
        console.log("Game has not started");
        
        //Remove and Add an event listener to the Start button
        startButton.removeEventListener("click", startGame);
        addListenerToElement(startButton, "click", startGame);
        return;
    } else if (inGame) {
        console.log("Game is currently underway");
        continueButton.removeEventListener("click", continueGame);
        addListenerToElement(continueButton, "click", continueGame);
    } else {
        //Remove and add a click listener to the high and low button
        lowerButton.removeEventListener("click", clickLower);
        addListenerToElement(lowerButton, "click", clickLower);
        higherButton.removeEventListener("click", clickHigher);
        addListenerToElement(higherButton, "click", clickHigher);
    }
    
    //Look for the card in the left
    var leftValue = findLeftCard();
    console.log("Left is: " + leftValue);
    
    //Create a card for reference
    var leftCard = new Card(leftValue);
    console.log(leftCard);
    
    //Calculate the odds
    gameDeck.calculateOdds(leftCard);

    //Look if there is a card in the right
    var rightValue = findRightCard();
    if (rightValue >= 0) {
        console.log("Right is: " + rightValue);
    } else {
        console.log("Your card is not revealed yet!");
    }
    
    console.log("Looking for deck shuffled notification");
    var deckShuffled = document.querySelector(".deck-wrap");
    if (deckShuffled.style.display != "none") {
        console.log("Deck has been shuffled!");
        gameDeck = new Deck();
        console.log("Deck has been recreated")
        
        //Remove the current displayed cards from the new deck
        var leftValue = findLeftCard();
        console.log("Left is: " + leftValue);
        gameDeck.getCard(leftValue);
        
        var rightValue = findRightCard();
        if (rightValue >= 0) {
            gameDeck.getCard(rightValue);
        }
    }
    
    console.log("Current deck has:");
    console.log("  Total Cards: " + gameDeck.cards.length.toString());
    console.log("  Discard Pile: " + gameDeck.discardPile.length.toString());
}

//Wait for the game to be loaded and call readCards
waitForLoad(function() {
    waitForCard(readCards, 0, true);
});
