function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLoad(callback) {
    console.log(document.querySelector(".dealer-card.left"));
    while (document.querySelector(".dealer-card.left") == null) {
        console.log("Waiting for cards to be loaded");
        await sleep(1000);    
    }
    console.log("Cards loaded!");
    callback();
}

function readCards() {
    console.log("Looking for Card 1");
    var dealerLeft = document.querySelector(".dealer-card.left");
    var cardLeftElement = dealerLeft.querySelector(".face2");
    var cardLeft = cardLeftElement.classList[0].replace("card-", "");
    console.log("Left is: " + cardLeft);

    console.log("Looking for Card 2");
    var yourCardRight = document.querySelector(".you-card.left");
    var cardRightface1 = yourCardRight.querySelector(".face1");
    var cardRightface2 = yourCardRight.querySelector(".face2");
    //See what card has the revealed card
    var suites=["diamond", "clover" ,"spade", "heart"];

    var check1 = false;
    var i;
    for (i=0; i < suites.length; i++) {
        if (cardRightface1.classList.contains("card-" + suites[i])) {
            check1 = true;
            break;
        }
    }
    var check2 = false;
    for (var i=0;i<suites.length;i++){
        if (cardRightface2.classList.contains("card-" + suites[i])) {
            check2 = true;
            break;
        }
    }

    var cardRightElement = check1 == true ? cardRightface1 : check2 == true ? cardRightface2 : undefined;
        
    if (cardRightElement != undefined) {
        var cardRight = cardRightElement.classList[0].replace("card-", "");
        console.log("Right is: " + cardRight);
    } else {
        console.log("Your card is not revealed yet!");
    }

    console.log("Looking for deck shuffled notification");
    var deckShuffled = document.querySelector(".deck-wrap");
    if (deckShuffled.style.display != "none") {
        console.log("Deck has been shuffled!");
    }
}

waitForLoad(readCards);
