# 🕹️SteamReviewsGuessr 
A game where you gotta guess what the game is based on a steam review on it

# 😎Members
Jules VAILLANT: Backend \
Gregory SIMONE: Frontend

# ⚙️Technologies
NodeJS, Python3, ExpressJS, HTML, CSS, JavaScript, Docker

# 🎥Project demo


# 🪳Known bugs
The score that goes down by 1 every second during the game on the "/reviews" route is being reset if another client connects to the same page. \
Also, if the first client sends his answer, the score will stop decreasing for the second client. \
The decreasing score should be **client-sided** but after many tries, we couldn't manage to fix it. 

# 📖Setup
To run this game in a Docker container, you can build the image yourself with the **dockerfile**. To do so, enter the following command:
```
docker build -t steam-review-image .
```

Once this image has been built, you can run a docker container using __docker-compose__ or __docker run__:
## 🐋Docker-compose __(recommended)__
```
docker-compose up -d
```

## 🐋Docker-run
```
docker run -d \
    --name steam-review-game \
    -p 8080:8080 \
    --restart unless-stopped \
    steam-review-image
    
```