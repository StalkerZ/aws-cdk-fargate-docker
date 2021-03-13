interface DnsCertificateConfig {
  certificateArn: string
  recordName: string
  recordValue: string
}

interface DnsConfig {
  domainName: string
  cloudfrontCertificate: DnsCertificateConfig
  appCertificate: DnsCertificateConfig
}

interface VpcConfig {
  cidr: string
  maxAzs: number
}

interface AppConfig {
  env: AppEnv
  imageTag: string
  containerPort: number
  appSecretArn: string
  dns: DnsConfig
  vpc: VpcConfig
}

const AWS_REGION = ''
const AWS_ACCOUNT_ID = ''

export const appId = 'MyApp'

export const env = {
  region: AWS_REGION,
  account: AWS_ACCOUNT_ID,
}

export enum AppEnv {
  DEV = 'development',
}

function getConfig(appEnv: AppEnv): AppConfig {
  switch (appEnv) {
    case AppEnv.DEV:
    default: {
      return {
        env: appEnv,
        imageTag: 'latest',
        containerPort: 3000,
        appSecretArn: `arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:${appId}Secret-<secret-id>`,
        dns: {
          cloudfrontCertificate: {
            certificateArn: `arn:aws:acm:us-east-1:${AWS_ACCOUNT_ID}:certificate/<certificate-uuid>`,
            recordName: '_<record-name>.<domain-name>.', // record name and value are visible in AWS ACM Console
            recordValue: '_<record-valuee>.<id>.acm-validations.aws.',
          },
          domainName: '<domain-name>', // my-app-example.xyz
          appCertificate: {
            certificateArn: `arn:aws:acm:${AWS_REGION}:${AWS_ACCOUNT_ID}:certificate/<certificate-uuid>`,
            recordName: '_<record-name>.<domain-name>.',
            recordValue: '_<record-valuee>.<id>.acm-validations.aws.',
          },
        },
        vpc: {
          cidr: '10.0.0.0/16',
          maxAzs: 2,
        },
      }
    }
  }
}

export default getConfig(AppEnv.DEV)
