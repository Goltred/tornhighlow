# TC Casino Helper - High-Low

This chrome extension introduces extra HTML elements into the High-Low casino
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

## Timers

Due to the way the casino games reveals cards and the elements used to display
the components of the game, the extension has to make heavy us of timed
functions in order to be able to accurately read the different elements on the
screen.
This might be avoidable by some other method that I don't currently know about,
but for now it seemed to provide the most reliable and fluid way to work
around the way Torn works.

Because of this, it is recommended to *take it slower* when playing the game so
that the reading of the components is not thrown off completely by fast
clicking.