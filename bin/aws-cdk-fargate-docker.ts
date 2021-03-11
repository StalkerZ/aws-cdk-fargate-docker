import 'source-map-support/register'
import { App, Tags } from '@aws-cdk/core'
import { CloudFrontStack } from '../lib/cloudfront/stack'
import { ECRStack } from '../lib/ecr/stack'
import { Route53Stack } from '../lib/route53/stack'
import { VPCStack } from '../lib/vpc/stack'
import { ECSStack } from '../lib/ecs/stack'
import { env, appId } from '../lib/common/config'
import { toSnakeCase } from '../lib/common/stringUtil'

const app = new App()

const { vpc } = new VPCStack(app, `${appId}VpcStack`, { env, appId })
const { hostedZone, cloudfrontCertificate, appCertificate } = new Route53Stack(
  app,
  `${appId}Route53Stack`,
  {
    env,
    appId,
  }
)

const { image } = new ECRStack(app, `${appId}ECRStack`, {
  env,
  appId,
})

new ECSStack(app, `${appId}ECSStack`, {
  env,
  appId,
  vpc,
  image,
  certificate: appCertificate,
  hostedZone,
})

new CloudFrontStack(app, `${appId}CloudFrontStack`, {
  env,
  appId,
  certificate: cloudfrontCertificate,
  hostedZone,
})

const ownerName = `${toSnakeCase(appId)}_owner`
Tags.of(app).add('owner', ownerName)
