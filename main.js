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
let score;
let intervalId;

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
  req.session.totalScore=0;
  req.session.questionIndex=0;
  req.session.language="english";
  req.session.questionNumber=10;
  res.render('home');
});

app.post('/', (req, res)=>{
  req.session.totalScore=0;
  req.session.questionIndex=0;
  req.session.language=req.body.review_language;
  req.session.questionNumber=req.body.questions_number;
  res.render('home');
});

//-------------------------------PAGE A PROPOS
app.get('/about', (req, res) =>{
  res.render('about');
});

//-------------------------------PAGE PARAMETRES
app.get('/settings', (req, res)=>{
  res.render('settings');
})

//-------------------------------PAGE QUESTION

app.post('/reviews', (req, res) => {
  req.session.questionIndex+=1;
  var reviewsData = [];
  var buttonsData = [];
  req.session.jeu =  new SteamGame(req.session.language);
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
    req.session.totalScore += score;
  }
  else {
    //console.log(`the game was : ${req.session.jeu.name}`)
    req.session.totalScore += 0;
  }
  clearInterval(intervalId);
  if(req.session.questionIndex<req.session.questionNumber){
    res.render('results', {boolResult : SteamGame.checkGame(req.session.jeu.name, gamesSuggestions[buttonAction]), goodGame: req.session.jeu.name, score: req.session.totalScore, goToSteam: SteamGame.getSteamAdress(req.session.jeu.steamID), question_index: req.session.questionIndex , question_number: req.session.questionNumber});
  }
  else{
    res.render('end',{boolResult : SteamGame.checkGame(req.session.jeu.name, gamesSuggestions[buttonAction]), goodGame: req.session.jeu.name, score: req.session.totalScore, goToSteam: SteamGame.getSteamAdress(req.session.jeu.steamID)}); 
  }
});

//----------------------------------Lance serveur
const port = 8000;
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});