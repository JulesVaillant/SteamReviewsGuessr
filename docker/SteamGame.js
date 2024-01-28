const fs = require('fs')
const games = JSON.parse(fs.readFileSync('gameList.json', 'utf8'));
const axios = require('axios');

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
     * @description Function that returns true if the actual and guessed name are the same
     * @param {String} realOne Name of the actual game
     * @param {String} guessedOne Name of the guessed game
     * @returns {Boolean} True if guessed == actual
     */
    static checkGame(realOne, guessedOne) {
        if (realOne === guessedOne) {
            return true
        }
        else {
            return false
        }
    }

    /**
    * @param {String} steamID 
    * @returns {String} returns the link of the Steam game
    */
    static getSteamAdress(steamID) {
        return "https://store.steampowered.com/app/" + steamID;
    }
}

module.exports = SteamGame;