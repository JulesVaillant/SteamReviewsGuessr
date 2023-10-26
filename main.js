const fs = require('fs')
const obj = JSON.parse(fs.readFileSync('gameList.json', 'utf8'));
const request = require('request')

let key = Math.floor(Math.random()*(Object.keys(obj).length-1)).toString()   //key = random [0; gameList.length]

let url = "https://store.steampowered.com/appreviews/" + obj[key]['appid'] + "?json=1"
//let url = "https://store.steampowered.com/appreviews/1046930?json=1"  //ERROR 
let options = {json: true};

request(url, options, (error, res, body) => {
    if (error) {
        return  console.log(error)
    };

    if (!error && res.statusCode == 200) {
        commentIndex = Math.floor(Math.random()*(res.body['reviews'].length-1)) //index = random [0 ; reviewsList.length]

        if(res.body['query_summary']['num_reviews'] != 0){
            console.log(obj[key]['name'])
            console.log(res.body['reviews'][commentIndex]['review'])
            if(res.body['reviews'][commentIndex]['voted_up']) console.log("LIKE")
            else console.log("DISLIKE")   
        }
        else{
            console.log("ERROR, NO REVIEWS FOUND FOR " + obj[key]['name'])
        }
    };
});
