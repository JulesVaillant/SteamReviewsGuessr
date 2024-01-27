const fs = require('fs')
const axios = require('axios');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const games = JSON.parse(fs.readFileSync('gameList.json', 'utf8'));

class SteamGame {
  /**
   * @param {string} reviewLanguage Language of the review: "english", "french", etc...
   * @description Will automatically pick a random Steam game in the game list. Reviews will be in the language of the parameter
   */
  constructor(reviewLanguage) {
    this.key = Math.floor(Math.random() * (Object.keys(games).length - 1)).toString();   //key = random [0; gameList.length]
    this.name = games[this.key]['name'];
    this.url = "https://store.steampowered.com/appreviews/" + games[this.key]['appid'] + "?json=1&language=" + reviewLanguage + "&num_per_page=100&purchase_type=all&day_range=365";
    this.steamReviews = [];
  }

  /**
   * @description Get reviews from Steam API and stores them into this.steamReviews[]
   * @returns DOES NOT RETURN ANYTHING
   */
  async downloadReviews() {
    try {
      const response = await axios.get(this.url);
      for (var i = 0; i < response.data['reviews'].length; i++) {
        this.steamReviews.push(response.data['reviews'][i]);
      }
    }
    catch (error) {
      throw new Error(`Error`);
    }
  }

  /**
   * @returns {string} returns the game name
   */
  getName() {
    return this.name;
  }

  /**
   * @param {int} number Number of random reviews that the method will return
   * @returns {String[]} Returns an array of reviews that people wrote
   */
  getRandomReviews(number) {
    const reviewSet = new Set();
    if (this.steamReviews.length < number) {
      number = this.steamReviews.length
    }
    while (reviewSet.size < number) {
      const randomNumber = Math.floor(Math.random() * (this.steamReviews.length - 1));
      if (this.steamReviews[randomNumber].hasOwnProperty('review')) {
        reviewSet.add(this.steamReviews[randomNumber]['review']);
      }
    }
    return Array.from(reviewSet);
  }

  /**
   * @param {int} number Number of games (INCLUDING THE GOOD ONE) that will be returned
   * @returns {String[]} Returns on array of video games title
   */
  getGamesSuggestions(number) {
    var goodGame = this.name;
    const gamesSet = new Set()
    gamesSet.add(goodGame);
    while (gamesSet.size < number) {
      const randomNumber = Math.floor(Math.random() * (Object.keys(games).length - 1)).toString();
      gamesSet.add(games[randomNumber]['name']);
    }
    var gamesArray = Array.from(gamesSet);
    for (let i = gamesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gamesArray[i], gamesArray[j]] = [gamesArray[j], gamesArray[i]];
    }
    return gamesArray;
  }

  /**
   * @description Checks if the game name passed as paramter is the correct game
   * @param {string} gameName Name of the game to check
   * @returns {boolean} Returns TRUE if the correct game name has been passed as paramter
   */
  checkGame(gameName) {
    if (gameName === this.name) {
      return true
    }
    else {
      return false
    }
  }
}


/**
 * @description Function that reduce the score by 1 every second. This value is defined when the setInterval is called. The score won't go below 10
 */
function reducingScore() {
  if (score > 10) {
    score -= 1;
  } else {
    clearInterval(intervalId); // Arrêter l'intervalle si maVariable <= 10
  }
}

const numberReviews = 3;
const numberGamesSuggestions = 4;
let totalScore = 0;
let score;
let intervalId;
test = new SteamGame("english");

async function main() {
  score = 100;
  await test.downloadReviews();
  var reviewIndex = 0;
  test.getRandomReviews(numberReviews).forEach(element => {
    reviewIndex += 1;
    console.log("REVIEW " + reviewIndex + ") " + element + "\n");
  });

  console.log("\n------------------------------\n")
  var gameSuggestionIndex = 0;
  gamesSuggestions = test.getGamesSuggestions(numberGamesSuggestions);
  gamesSuggestions.forEach(element => {
    gameSuggestionIndex += 1;
    console.log("GAME " + gameSuggestionIndex + ") " + element);
  })

  intervalId = setInterval(reducingScore, 1000); // starts the score coutdown

  /*readline.question('Which of these? ', num => {
    if (test.checkGame(gamesSuggestions[num - 1])) {
      console.log("Well done! 👍");
      totalScore += score;
    }
    else {
      console.log(`Too bad 👎, the game was : ${test.getName()}`);
      totalScore += 0;
    }
    console.log("Your current score is: " + totalScore)
    clearInterval(intervalId);
    readline.close();
  });*/
}


main()