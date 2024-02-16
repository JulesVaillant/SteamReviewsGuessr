#  Docker
To run this game in a Docker container, you can build the image yourself with the **dockerfile**. To do so, enter the following command:
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
or by using this **docker-compose** config by typing:
```
sudo docker-compose up -d
```
