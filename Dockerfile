FROM python:3.7


COPY . /app
WORKDIR /app


RUN pip install -r requirements.txt

ENV PORT 5000

CMD exec gunicorn --worker-class eventlet -w 1 app:app --timeout 120