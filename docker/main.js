const fs = require('fs')
const axios = require('axios');
const games = JSON.parse(fs.readFileSync('gameList.json', 'utf8'));
const schedule = require('node-schedule');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()

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

const port = 8000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

var buttonsData = [];
var reviewsData = [];
var test;

app.get('/', (req, res) => {
  reviewsData = [];
  buttonsData = [];
  test = new SteamGame("english");
  score = 100;
  console.log("before results");
  (async () => {
    try {
      const resultat = await test.downloadReviews();
      console.log("got results");
      var reviewIndex = 0;
      test.getRandomReviews(numberReviews).forEach(element => {
        reviewsData.push({label: reviewIndex, value: element});
        reviewIndex += 1;
        console.log("REVIEW " + reviewIndex + ") " + element + "\n");
      });

        var gameSuggestionIndex = 0;
        gamesSuggestions = test.getGamesSuggestions(numberGamesSuggestions);
        gamesSuggestions.forEach(element => {
          buttonsData.push({label: element, gameIndex: gameSuggestionIndex});
          gameSuggestionIndex += 1;
        });

        intervalId = setInterval(reducingScore, 1000); // starts the score coutdown

        res.render('form', { buttons: buttonsData , reviewsEjs: reviewsData});
      }
    catch (erreur) {
      console.error(erreur);
    }
  })();
});

app.post('/submit', (req, res) => {
  const buttonAction = req.body.buttonAction;
  console.log(`Le bouton avec l'action ${buttonAction} a été appuyé.`);
  //res.send(`Le bouton avec l'action ${buttonAction} a été appuyé.`);

  if (test.checkGame(gamesSuggestions[buttonAction])) {
    //res.write("Well done! 👍");
    console.log("GG")
    totalScore += score;
  }
  else {
    //res.write(`Too bad 👎, the game was : ${test.getName()}`);
    console.log(`the game was : ${test.getName()}`)
    totalScore += 0;
  }
  //res.write("Your current score is: " + totalScore)
  clearInterval(intervalId);
  res.render('results', {boolResult : test.checkGame(gamesSuggestions[buttonAction]), goodGame: test.getName()});
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});


/*http.createServer(async (req, res) => {
  test = new SteamGame("english");
  res.write(`score:${totalScore}`); //write a response to the client
  score = 100;
  await test.downloadReviews();
  var reviewIndex = 0;
  test.getRandomReviews(numberReviews).forEach(element => {
    reviewIndex += 1;
    res.write("REVIEW " + reviewIndex + ") " + element + "\n");
  });

  res.write("\n------------------------------\n")
  var gameSuggestionIndex = 0;
  gamesSuggestions = test.getGamesSuggestions(numberGamesSuggestions);
  gamesSuggestions.forEach(element => {
    gameSuggestionIndex += 1;
    res.write("GAME " + gameSuggestionIndex + ") " + element);
  })

  intervalId = setInterval(reducingScore, 1000); // starts the score coutdown

  readline.question('Which of these? ', num => {
    if (test.checkGame(gamesSuggestions[num - 1])) {
      res.write("Well done! 👍");
      totalScore += score;
    }
    else {
      res.write(`Too bad 👎, the game was : ${test.getName()}`);
      totalScore += 0;
    }
    res.write("Your current score is: " + totalScore)
    clearInterval(intervalId);
    readline.close();
  });
  
  res.end(); //end the response
}).listen(8080); //the server object listens on port 8080 
*/

/*const job = schedule.scheduleJob('* * * * *', function(){
  exec("python3 gameListMaker.py");
});*/