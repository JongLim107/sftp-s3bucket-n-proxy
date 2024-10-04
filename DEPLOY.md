## Batch SVC Deploy to AWS

Steps

1. Get AWS Keys from AWS user portal https://learner.awsapps.com/start/#/?tab=accounts

```sh
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_SESSION_TOKEN=""
```

2. Install required deps if not already done
   To generate a new library, use:

```sh
npm ci
```

3. Build docker image for batch svc

```sh
docker build -f apps/batch-svc/Dockerfile . -t image-name
```

4. Login to aws ecr

```sh
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin aws-accesss-password
```

5. Push the image to aws ecr

```sh
docker push image-name
```
