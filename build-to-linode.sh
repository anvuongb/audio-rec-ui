docker build . -t audio-ui:$1
docker save audio-ui:$1 -o audio-ui.$1
scp audio-ui.$1 root@45.79.201.32:/root/docker-images