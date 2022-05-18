docker stop audio-ui
docker rm audio-ui
docker images | grep audio-ui | awk '{print $3}' | xargs -L1 docker rmi
docker load -i audio-ui.$1
docker run --name audio-ui -d -p 3000:80 audio-ui:$1
