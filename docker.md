#  Docker
To run this game in a Docker container, you can build the image yourself with the **dockerfile**. To do so, get in this directory, then enter this command:
```
sudo docker build -t steam-review-image .
```
Once this image has been built, you can run a docker container using this **docker run** command:
```
sudo docker run -d \
    --name steam-review-game \
    -p 8080:8080 \
    --restart unless-stopped \
    steam-review-image
    
```
or by using this **docker-compose.yaml** config:
```
version: '3'
services:
  steam-review-guessr:
    container_name: steam-review-game
    image: steam-review-image
    ports:
      - '8080:8080'
    restart: unless-stopped
```
