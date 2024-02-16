//-------------------------requirements

const bodyParser = require('body-parser');
const express = require('express')
var favicon = require('serve-favicon');
const session = require('express-session');
const SteamGame = require('./SteamGame');
const app = express()
app.use(express.static(__dirname + '/public'));

//-----------------------functions
/**
 * @description Function that reduce the score by 1 every second. This value is defined when the setInterval is called. The score won't go below 10
 */
function reducingScore() {
  if (score > 10) {
    score -= 1;
  } else {
    clearInterval(intervalId); // Arrêter l'intervalle si score <= 10
  }
}

//---------------------------variables

const numberReviews = 3;
const numberGamesSuggestions = 4;
let totalScore = 0;
let score;
let intervalId;
var buttonsData = [];
var reviewsData = [];
let questionIndex=0;
let questionNumber=10;

//-------------------------------Express config

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon("./static/favicon.ico"))
app.use(session({
  secret: 'votre_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Notez que secure devrait être true en production avec HTTPS
}))

//-------------------------------PAGE ACCUEIL
app.get('/', (req, res) =>{
  questionIndex=0;
  questionNumber=10;
  res.render('home');
});

//-------------------------------PAGE A PROPOS
app.get('/about', (req, res) =>{
  res.render('about');
});

//-------------------------------PAGE QUESTION

app.get('/reviews', (req, res) => {
  questionIndex+=1;
  reviewsData = [];
  buttonsData = [];
  req.session.jeu =  new SteamGame("english");
  score = 100;
  //console.log("before results");
  (async () => {
    try {
      const resultat = await req.session.jeu.downloadReviews();
      //console.log("got results");
      var reviewIndex = 0;
      req.session.jeu.getRandomReviews(numberReviews).forEach(element => {
        reviewsData.push({label: reviewIndex, value: element});
        reviewIndex += 1;
        //console.log("REVIEW " + reviewIndex + ") " + element);
      });

        var gameSuggestionIndex = 0;
        gamesSuggestions = req.session.jeu.getGamesSuggestions(numberGamesSuggestions);
        gamesSuggestions.forEach(element => {
          buttonsData.push({label: element, gameIndex: gameSuggestionIndex});
          gameSuggestionIndex += 1;
        });

        intervalId = setInterval(reducingScore, 1000); 

        res.render('form', { buttons: buttonsData , reviewsEjs: reviewsData});
      }
    catch (erreur) {
      console.error(erreur);
    }
  })();
});

//----------------------------------PAGE REPONSE

app.post('/answer', (req, res) => {
  const buttonAction = req.body.buttonAction;
  //console.log(`Le bouton avec l'action ${buttonAction} a été appuyé.`);
  if (SteamGame.checkGame(req.session.jeu.name, gamesSuggestions[buttonAction])) {
    //console.log("GG")
    totalScore += score;
  }
  else {
    //console.log(`the game was : ${req.session.jeu.name}`)
    totalScore += 0;
  }
  clearInterval(intervalId);
  if(questionIndex<questionNumber){
    res.render('results', {boolResult : SteamGame.checkGame(req.session.jeu.name, gamesSuggestions[buttonAction]), goodGame: req.session.jeu.name, score: totalScore, goToSteam: SteamGame.getSteamAdress(req.session.jeu.steamID), question_index: questionIndex , question_number: questionNumber});
  }
  else{
    res.render('end',{boolResult : SteamGame.checkGame(req.session.jeu.name, gamesSuggestions[buttonAction]), goodGame: req.session.jeu.name, score: totalScore, goToSteam: SteamGame.getSteamAdress(req.session.jeu.steamID)}); 
  }
});

//----------------------------------Lance serveur
const port = 8000;
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});