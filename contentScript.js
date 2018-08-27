//Classes definitions
class Logger {
    constructor() {
    }
    
    log(msg) {
        if (debugPrint) {
            console.log(msg);
        }
    }
}

//Define the Card class
class Card {
    constructor(name, suite) {
        this.name = name;
        this.value = cardValues[name];
        this.suite = suite;
    }
    
    toString() {
        return this.suite + "-" + this.name;
    }
}

//Define the Deck class
class Deck {
    constructor() {
        this.cards = [];
        this.discardPile = [];
        
        //Create the whole deck, 12 cards per suite
        for (var i = 0; i < suites.length; i++) {
            for (var key in cardValues) {
                var newCard = new Card(key, suites[i]);
                this.cards.push(newCard);
            }
        }
    }
    
    discard(card) {
        //Place the given card in the discard pile
        //and update the UI
        
        this.discardPile.push(card);
        this.uiUpdateDiscard();
    }
    
    getCard(name, suite) {
        //Get a given card from the deck based on the given
        //name and suite. Adding it to the discard pile.
        
        name = name.toUpperCase();
        for (var i = 0; i < this.cards.length; i++) {
            var card = this.cards[i];
            if (card.name == name && card.suite == suite) {
                this.cards.splice(i, 1);
                this.discard(card);
                return card;
            }
        }
        
        console.log("Found a card that should NOT be on the deck.");
        console.log("There might be an issue with the logic");
        console.log("Found a " + name + " of " + suite);
        uiUpdateStatus("ERROR. Please check developer console");
        
        return undefined;
    }
    
    uiUpdateDiscard() {
        //Update the Discard Pile UI
        
        var discardDiv = document.getElementById("tchlDiscard");
        if (discardDiv) {
            var str = "";
            var cardCounter = 0
            for (var i in this.discardPile) {
                var card = this.discardPile[i];
                
                //get the url of the image
                var imgPath = chrome.runtime.getURL('images/cards/' + card.toString() + '.png');
                if (cardCounter > 9) {
                    str += '<br \>';
                    cardCounter = 0;
                }
                str += '<img class="tchlcard-24" src="' + imgPath + '" alt="' + card.toString() + '", title="' + card.toString() + '"></img>';
                
                cardCounter += 1;
            }
            discardDiv.innerHTML = str;
        }
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
        
        uiUpdateChances(hChance, lChance, sChance);
        
        logger.log("Chances are:");
        logger.log("  Higher: " + hChance.toString());
        logger.log("  Lower: " + lChance.toString());
        logger.log("  Same: " + sChance.toString());
    }
}

//Globals
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

var lastFoundLeft = undefined;
var lastFoundRight = undefined;
var debugPrint = false;

//Element constants
const startButtonSelector = ".action-btn-wrap.startGame";

var suites=["diamonds", "clubs" ,"spades", "hearts"];

//Setup the deck
gameDeck = new Deck();

//Setup the logger and replace the console for it
logger = new Logger();

//HTML Update functions

function uiUpdateChances(higher, lower, same) {
    var higherSpan = document.getElementById("tchlhigher");
    var lowerSpan = document.getElementById("tchllower");
    var sameSpan = document.getElementById("tchlsame");
    var suggestionSpan = document.getElementById("tchlsuggestion");
    var higherParent = higherSpan.parentElement;
    var lowerParent = lowerSpan.parentElement;
    
    if (higher == 0 && lower == 0 && same == 0) {
        higherSpan.innerHTML = "";
        lowerSpan.innerHTML = "";
        sameSpan.innerHTML = "";
        suggestionSpan.innerHTML = "";
        
        higherParent.classList.toggle("best", false);
        lowerParent.classList.toggle("best", false);
    } else {
        higherSpan.innerHTML = higher.toFixed(2);
        lowerSpan.innerHTML = lower.toFixed(2);
        sameSpan.innerHTML = same.toFixed(2);
        
        if (higher > lower) {
            higherParent.classList.toggle("best", true);
            lowerParent.classList.toggle("best", false);
        } 
        else if (lower > higher)
        {
            higherParent.classList.toggle("best", false);
            lowerParent.classList.toggle("best", true);
        } else {
            higherParent.classList.toggle("best", false);
            lowerParent.classList.toggle("best", false);
        }
        
        var suggestion = higher > lower ? "Higher" : higher < lower ? "Lower" : "";
        var suggestionStr = "You should pick <strong>" + suggestion + "</strong>";
        if (suggestion == "") {
            suggestionStr = "It doesn't really matter what you should pick";
        }
        
        suggestionSpan.innerHTML = suggestionStr;
    }
}

function uiUpdateStatus(message) {
    var statusElement = document.getElementById("tchlstatus");
    statusElement.innerHTML = message;
}

function uiClearChances() {
    var statusElement = document.getElementById("tchlstatus");
    statusElement.innerHTML = message;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLoad(callback) {
    logger.log(document.querySelector(".dealer-card.left"));
    while (document.querySelector(".dealer-card.left") == null) {
        uiUpdateStatus("Waiting for cards to be loaded");
        await sleep(2000);    
    }
    
    callback();
}

async function waitTime(callback, sleepTime) {
    await sleep(sleepTime);
    callback()
}

async function waitForCard(callback, side, remove) {
    var found = false;
    var cardFound = undefined;
    var findCallback = undefined;
    remove = remove == undefined ? false : remove;
    step = 0 //Right card should be hidden
    if (side == 0) {
        //Look in the dealer position
        logger.log("Waiting for the left side card to load");
        findCallback = findLeftCard;
    } 
    else {
        //Look in the right position
        logger.log("Waiting for the right side card to load");
        findCallback = findRightCard;
        step = 1 //The right card should be there
    }
    
    while (!found) {
        var card = findCallback(remove);
        var sleepTime = 1500;
        if (card != -1) {
            found = true;
            if (remove) {
                //Remove the card from the deck
                gameDeck.getCard(card.name, card.suite);
            }
            sleepTime = 500;
        } else {
            //Check if the start button is visible as it would mean
            //that the game was lost
            var startButton = document.querySelector(startButtonSelector);
            if (buttonIsVisible(startButton)) {
                //Exit since the start button is visible
                break;
            }
        }
        logger.log("Sleeping");
        await sleep(sleepTime);    
    }
    
    callback(step);
}

function addListenerToElement(el, ev, callback) {
    logger.log("Added listener on " + ev);
    el.addEventListener(ev, callback);
}

function clickStart() {
    uiUpdateStatus("Game currently running");
    waitTime(function() {
        waitForCard(readCards, 0, true);
    }, 800);
}

function clickContinue() {
    uiUpdateStatus("Game currently running");
    waitTime(function() {
        waitForCard(readCards, 0, true);
    }, 800);
}

function clickLower() {
    uiUpdateStatus("Game currently running");
    waitTime(function() {
        waitForCard(readCards, 1, true);
    }, 800);
}

function clickHigher() {
    uiUpdateStatus("Game currently running");
    waitTime(function() {
        waitForCard(readCards, 1, true);
    }, 800);
}

function findLeftCard(updateLastFound) {
    logger.log("Looking for Card 1");
    var dealerLeft = document.querySelector(".dealer-card.left");
    var foundCard = findCardInElement(dealerLeft, 0, updateLastFound);
    
    logger.log("Left is: " + foundCard.name + " of " + foundCard.suite);
    return foundCard;
}

function findRightCard(updateLastFound) {
    logger.log("Looking for Card 2");
    var yourCardRight = document.querySelector(".you-card.left");
    var foundCard = findCardInElement(yourCardRight, 1, updateLastFound);
    
    logger.log("Right is: " + foundCard.name + " of " + foundCard.suite);
    return foundCard;
}

function findCardInElement(cardElement, side, updateLastFound) {
    //Find the card amongst the children elements of the right position
    var foundCardEl = findCard(cardElement, side, updateLastFound);
    
    var name = -1;
    var suite = "";
    if (foundCardEl != undefined) {
        var cardDetails = foundCardEl.classList[0].replace("card-", "");
        name = cardDetails.split("-")[1];
        suite = cardDetails.split("-")[0];
    }
    
    if (name != -1 ) {
        var card = new Card(name, suite);
        return card
    } else {
        return -1
    }
}

function findCard(el, side, setLastFound) {
    setLastFound = setLastFound == undefined ? false : setLastFound;
    
    var lastFoundElement = side == 0 ? lastFoundLeft : undefined;
        
    if (setLastFound == false && lastFoundElement != undefined) {
        return lastFoundElement;
    }
    
    var cardFace1 = el.querySelector(".face1");
    var cardFace2 = el.querySelector(".face2");
    
    var check1 = findSuite(cardFace1, lastFoundElement);
    var check2 = findSuite(cardFace2, lastFoundElement);
    
    var returnElement = check1 == true ? cardFace1 : check2 == true ? cardFace2 : undefined;
    
    if (setLastFound && returnElement != undefined) {
        if (side == 0) {
            lastFoundLeft = returnElement;
        }
    } else {
        //Clear the last found variables if the start button is present
        var startButton = document.querySelector(startButtonSelector);
        
        if (buttonIsVisible(startButton)) {
            lastFoundLeft = undefined;
        }
    }
    
    return returnElement;
}

function findSuite(face, lastFoundElement) {
    //See what element has the revealed card
    
    //Check first if the class contains "back"
    if (face.classList.value.includes("back") && face != lastFoundElement) {
        return false;
    }
        
    for (i=0; i < suites.length; i++) {
        if (face.classList.value.includes(suites[i]) && face != lastFoundElement) {
            return true;
        }
    }
    
    return false;
}

function buttonIsVisible (buttonElement) {
    return (buttonElement.clientHeight != 0 && buttonElement.clientHeight != 0);
}

function readCards(step) {
    //Read the cards in the screen.
    //Step specifies what card should be visible:
    //   0: Only left
    //   1: Both
    
    //default value for step
    step = step == undefined ? 0 : step;
    
    var startButton = document.querySelector(startButtonSelector);
    var continueButton = document.querySelector(".action-btn-wrap.continue");
    var lowerButton = document.querySelector(".action-btn-wrap.low");
    var higherButton = document.querySelector(".action-btn-wrap.high");
    
    var started = !buttonIsVisible(startButton);
    var inGame = buttonIsVisible(continueButton);
    if (!started && !inGame) {
        logger.log("Game has not started");
        uiUpdateStatus("Game has not started");
        uiUpdateChances(0, 0, 0);
        
        //Remove and Add an event listener to the Start button
        startButton.removeEventListener("click", clickStart);
        addListenerToElement(startButton, "click", clickStart);
        return;
    } else if (inGame) {
        logger.log("Game currently running");
        //uiUpdateStatus("Game currently running");
        
        continueButton.removeEventListener("click", clickContinue);
        addListenerToElement(continueButton, "click", clickContinue);
    } else {
        logger.log("Game currently running");
        //uiUpdateStatus("Game currently running");
        //Remove and add a click listener to the high and low button
        lowerButton.removeEventListener("click", clickLower);
        addListenerToElement(lowerButton, "click", clickLower);
        higherButton.removeEventListener("click", clickHigher);
        addListenerToElement(higherButton, "click", clickHigher);
    }
    
    //Look for the card in the left
    var leftCard = findLeftCard();
    
    //Calculate the odds
    gameDeck.calculateOdds(leftCard);

    //Look if there is a card in the right
    if (step == 1) {
        var rightCard = findRightCard();
        if (rightCard == -1) {
            logger.log("Your card is not revealed yet!");
        }
    }
    
    logger.log("Looking for deck shuffled notification");
    var deckShuffled = document.querySelector(".deck-wrap");
    if (deckShuffled.style.display != "none") {
        logger.log("Deck has been shuffled!");
        gameDeck = new Deck();
        logger.log("Deck has been recreated")
    }
    
    logger.log("Current deck has:");
    logger.log("  Total Cards: " + gameDeck.cards.length.toString());
    logger.log("  Discard Pile: " + gameDeck.discardPile.length.toString());
}

//Add the HTML element to the page
var xmlHttp = null;

xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", chrome.extension.getURL ("status.html"), false );
xmlHttp.send( null );

var statusElement = document.createElement("div");
statusElement.innerHTML = xmlHttp.responseText;
var highLowWrap = document.querySelector(".highlow-main-wrap");
highLowWrap.parentNode.insertBefore(statusElement, highLowWrap.nextSibling);

//Add the icon
var iconDiv = document.getElementById("tchllogo");
var logoPath = chrome.runtime.getURL('images/icon48.png');
iconDiv.innerHTML = '<img src="' + logoPath + '"></img>';

//Wait for the game to be loaded and call readCards
waitForLoad(function() {
    waitForCard(readCards, 0, true);
});
