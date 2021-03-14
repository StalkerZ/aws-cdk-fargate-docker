import {
  InterfaceVpcEndpointAwsService,
  SubnetType,
  Vpc,
} from '@aws-cdk/aws-ec2'
import { App, Stack } from '@aws-cdk/core'
import config from '../common/config'
import { CommonStackProps } from '../common/stack'

export class VPCStack extends Stack {
  readonly vpc: Vpc

  constructor(scope: App, id: string, props: CommonStackProps) {
    super(scope, id, props)

    const { appId } = props

    /*
      VPC creates the following resources:
      - VPC
      - 2 public and 2 private subnets with associated route tables 
      - 2 NAT gateways
      - 1 Internet Gateway
    */
    this.vpc = new Vpc(this, `${appId}VPC`, {
      cidr: config.vpc.cidr,
      maxAzs: config.vpc.maxAzs,
      subnetConfiguration: [
        {
          name: `${appId}Public`,
          cidrMask: 26, // 59 available addresses (64 - 5 reserved by AWS)
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: `${appId}Private`,
          cidrMask: 26,
          subnetType: SubnetType.PRIVATE,
        },
      ],
    })

    const secretManagerEndpoint = this.vpc.addInterfaceEndpoint(
      `${appId}SecretsManagerEndpoint`,
      {
        service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        subnets: {
          subnetType: SubnetType.PRIVATE,
        },
      }
    )

    secretManagerEndpoint.connections.allowDefaultPortFromAnyIpv4()
  }
}
