docker build -t giangltdau/simple-reactjs:v1.0.0 .

docker run -d -p 3000:80 --name test-reactjs giangltdau/simple-reactjs:v1.0.0

docker push giangltdau/simple-reactjs:v1.0.0



services:
  app:
    image: giangltdau/simple-reactjs:v1.0.0
    container_name: simple-reactjs
    ports:
      - "80:80"
    restart: unless-stopped
