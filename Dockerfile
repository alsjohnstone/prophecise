
FROM safakcirag/fbprophet
RUN apk add g++
RUN apk add linux-headers
RUN apk add libc-dev
RUN apk add musl-dev
RUN pip install pandas
COPY requirements.txt /
RUN python -m pip install --upgrade pip
RUN pip3 install numpy
RUN pip install -r /requirements.txt
COPY . /
WORKDIR /
RUN chmod +x ./gunicorn_starter.sh
ENTRYPOINT ["sh","./gunicorn_starter.sh"]
