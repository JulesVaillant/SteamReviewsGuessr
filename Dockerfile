FROM alpine:latest
RUN apk add --no-cache nodejs npm
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN apk add --no-cache python3 py3-pip
RUN pip3 install --no-cache --upgrade pip setuptools --break-system-packages
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
RUN pip install requests --break-system-packages
EXPOSE 8000/tcp
EXPOSE 8000/udp
ENTRYPOINT [ "node" ]
CMD [ "main.js" ]