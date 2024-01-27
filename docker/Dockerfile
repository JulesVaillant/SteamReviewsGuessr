FROM alpine:latest
RUN apk add --no-cache nodejs npm
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
WORKDIR /app
COPY . /app
RUN npm install axios
RUN npm install node-schedule
RUN npm install body-parser
RUN npm install express
RUN npm install serve-favicon
RUN npm install express-session
RUN pip install requests
EXPOSE 8080/tcp
EXPOSE 8080/udp
ENTRYPOINT [ "node" ]
CMD [ "main.js" ]