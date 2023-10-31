# 🕹️SteamReviewsGuessr 
A game where you gotta guess what the game is based on a steam review on it

# 📖How to use
## 📜Game list
The __gameList.json__ file contains a list of popular video games on Steam. You can use this list as it is, or you can update it by running the __gameListMaker.py__ script. To do so:
```
python3 gameListMaker.py
```

To keep this list updated, you also can use a crontab process to run the script regularly. To do so:
```
nano crontab -e
``` 
Then write down the command you want. The following line will execute the script every day at 00:00. To set a different time we recommand you to use the very useful and powerful **[crontab.guru](https://crontab.guru)**.
```
0 0 */1 * * python3 /<path>/<to>/gameListMaker.py
```
