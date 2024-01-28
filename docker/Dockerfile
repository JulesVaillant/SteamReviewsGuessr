FROM alpine:latest
RUN apk add --no-cache nodejs npm
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
WORKDIR /app
COPY . /app
COPY static /app/static
COPY views /app/views
RUN npm install axios
RUN npm install node-schedule
RUN npm install body-parser
RUN npm install express
RUN npm install ejs
RUN npm install serve-favicon
RUN npm install express-session
RUN pip install requests
EXPOSE 8000/tcp
EXPOSE 8000/udp
ENTRYPOINT [ "node" ]
CMD [ "main.js" ]