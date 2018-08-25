# TC Casino Helper - High-Low

This chrome extension introduced extra HTML elements into the High-Low casino
game in Torn city. The extension presents the odds of getting a Higher, Lower
or Same card as the dealer.

Odds are calculated based on a 52 cards deck, and it currently takes into
account the fact that decks are shuffled.
When the extension loads, it "creates" a new deck and removes the first card
into a discard pile, displayed under the odds for reference.

As the game progress, cards are added into the discard pile, thus calculating
properly the chances of the next card.
Bear in mind that this game has extremely high chances of being rigged, this
prevents any kind of proper prediction to be accurate.

The extension is only active on the High-Low game.