FROM python:3.12-slim

WORKDIR /srv/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -m appuser && chown -R appuser:appuser /srv/app
USER appuser

EXPOSE 8000
CMD ["waitress-serve", "--host=0.0.0.0", "--port=8000", "app.main:app"]
