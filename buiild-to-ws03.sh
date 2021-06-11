docker build . -t registry.vngcloud.vn/dal/biometrics-ui:$1
docker save registry.vngcloud.vn/dal/biometrics-ui:$1 -o biometrics-ui.$1
scp biometrics-ui.$1 ws03:/data/users/home/anvb/biometrics-ui