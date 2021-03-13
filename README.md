# AWS CDK Fargate Docker example project



## Features

- Fargate cluster with Application Load Balancer and 2 availability zones
- CloudFront distribution passing traffic to Application Load Balancer
- Passing environment variables and secrets to containers from AWS Secrets Manager
- Domain name with a TLS certificate and HTTPS
- Docker container created from create-react-app project with minimal changes (added a Dockerfile).
- Tags for all the resources

## Setup

Install AWS CDK

```bash
brew install node awscli
npm install -g aws-cdk
```

Setup Domain and certificates

1. Register a domain with AWS
2. Create AWS ACM certificate in us-east-1. It is going to be used with CloudFront and must be in us-east-1 region.
3. Create AWS ACM certificate in your region. It is going to be used with Application Load Balancer.

Create ECR stack and deploy create-react-app docker image:

```base
cd my-app
docker build -t my-app .
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com
docker tag <tag> <aws-account-id>.dkr.ecr.<region>.amazonaws.com/<appIdLowercase>-repository:latest
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/<appIdLowercase>-repository:latest
```

Create secret in AWS Secrets Manager:

1. Open AWS Secrets Manager console > Store a new secret > Other type of secrets
2. Add key/value, key must be "secretKey", value can be any string.
3. Give secret a name: `${appId}Secret`

Configure your region, AWS account id and certificate details in /lib/common/config.ts

## Useful CDK commands

* `cdk synth`   emit synthesized CDK template
* `cdk diff`    show difference between deployed stack and the current state
* `cdk deploy`  deploy this stack or --all stacks
* `cdk destroy` destroy this stack

## Removing setup
* Destroy all stacks
* You will have ACM Certificates, hosted zone (with an NS record, $0.50 per month), AWS Secrets Manager secret ($0.40 per month) left in your AWS infra
