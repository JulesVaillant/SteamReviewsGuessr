const fs = require('fs')
const axios = require('axios');
const games = JSON.parse(fs.readFileSync('gameList.json', 'utf8'));
const schedule = require('node-schedule');
//const { exec } = require('child_process');
const bodyParser = require('body-parser');
const express = require('express')
var favicon = require('serve-favicon');
const session = require('express-session');
const app = express()

class SteamGame {
  /**
   * @param {string} reviewLanguage Language of the review: "english", "french", etc...
   * @description Will automatically pick a random Steam game in the game list. Reviews will be in the language of the parameter
   */
  constructor(reviewLanguage) {
    this.key = Math.floor(Math.random() * (Object.keys(games).length - 1)).toString();   //key = random [0; gameList.length]
    this.name = games[this.key]['name'];
    this.steamID = games[this.key]['appid'];
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
   * @returns {int} returns Steam ID of the game 
   */
  getSteamAdress(){
    return "https://store.steampowered.com/app/"+this.steamID;
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

/**
 * 
 * @param {String} text Text to break lines if they are > maxLineLength
 * @param {int} maxLineLength  Max size before break line
 * @returns {String} returns string formatted with line breaks if they are > maxLineLength
 */
function formatText(text, maxLineLength) {
  const lines = text.split('\n');
  const formattedLines = [];

  lines.forEach(line => {
    while (line.length > maxLineLength) {
      formattedLines.push(line.substring(0, maxLineLength));
      line = line.substring(maxLineLength);
    }
    formattedLines.push(line);
  });

  return formattedLines.join('\n');
}

const numberReviews = 3;
const numberGamesSuggestions = 4;
let totalScore = 0;
let score;
let intervalId;

const port = 8000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//TODO: change this line when docker folder will no longer exist
app.use(favicon(__dirname + '/../static/favicon.ico'));
app.use(session({
  secret: 'votre_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Notez que secure devrait être true en production avec HTTPS
}))

var buttonsData = [];
var reviewsData = [];
//var req.session.jeu;

app.get('/', (req, res) => {
  
  reviewsData = [];
  buttonsData = [];
  req.session.jeu = new SteamGame("english");
  score = 100;
  console.log("before results");
  (async () => {
    try {
      const resultat = await req.session.jeu.downloadReviews();
      console.log("got results");
      var reviewIndex = 0;
      req.session.jeu.getRandomReviews(numberReviews).forEach(element => {
        element = formatText(element, 200);
        reviewsData.push({label: reviewIndex, value: element});
        reviewIndex += 1;
        console.log("REVIEW " + reviewIndex + ") " + element + "\n");
      });

        var gameSuggestionIndex = 0;
        gamesSuggestions = req.session.jeu.getGamesSuggestions(numberGamesSuggestions);
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
  
  if (req.session.jeu.checkGame(gamesSuggestions[buttonAction])) {
    console.log("GG")
    totalScore += score;
  }
  else {
    console.log(`the game was : ${req.session.jeu.getName()}`)
    totalScore += 0;
  }
  clearInterval(intervalId);
  res.render('results', {boolResult : req.session.jeu.checkGame(gamesSuggestions[buttonAction]), goodGame: req.session.jeu.getName(), score: totalScore, goToSteam: req.session.jeu.getSteamAdress()});
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});