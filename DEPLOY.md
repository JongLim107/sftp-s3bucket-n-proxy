## Batch SVC Deploy to AWS

Steps

1. Get AWS Keys from AWS user portal https://activatesg.awsapps.com/start/#/?tab=accounts

```sh
export AWS_ACCESS_KEY_ID="ASIAVXMJQC"
export AWS_SECRET_ACCESS_KEY="LjWL6s2"
export AWS_SESSION_TOKEN="asdfsdadfasdf"
```

2. Install required deps if not already done
   To generate a new library, use:

```sh
npm ci
```

3. Build docker image for batch svc

```sh
docker build -f apps/batch-svc/Dockerfile . -t 512537375472.dkr.ecr.ap-southeast-1.amazonaws.com/ecr-sgwp-sitizapp-sftp-batch-svc:SGWP-SIT-YYYYMMDDHHMM
```

4. Login to aws ecr

```sh
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 512537375472.dkr.ecr.ap-southeast-1.amazonaws.com
```

5. Push the image to aws ecr

```sh
docker push 512537375472.dkr.ecr.ap-southeast-1.amazonaws.com/ecr-sgwp-sitizapp-sftp-batch-svc:SGWP-SIT-YYYYMMDDHHMM
```
