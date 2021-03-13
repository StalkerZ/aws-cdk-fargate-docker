import { ICertificate } from '@aws-cdk/aws-certificatemanager'
import {
  AllowedMethods,
  Distribution,
  OriginProtocolPolicy,
  PriceClass,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront'
import { HttpOrigin } from '@aws-cdk/aws-cloudfront-origins'
import {
  ARecord,
  CnameRecord,
  IHostedZone,
  RecordTarget,
} from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'
import { App, Stack } from '@aws-cdk/core'
import config from '../common/config'
import { CommonStackProps } from '../common/stack'
import { Subdomain } from '../common/domain'

interface CloudFrontStackProps extends CommonStackProps {
  certificate: ICertificate
  hostedZone: IHostedZone
}

export class CloudFrontStack extends Stack {
  readonly distribution: Distribution

  constructor(scope: App, id: string, props: CloudFrontStackProps) {
    super(scope, id, props)

    const { appId, certificate, hostedZone } = props

    const { domainName } = config.dns

    this.distribution = new Distribution(this, `${appId}Distribution`, {
      defaultBehavior: {
        origin: new HttpOrigin(`${Subdomain.elb}.${domainName}`, {
          protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
        }),
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [
        domainName,
        `${Subdomain.www}.${domainName}`,
        `${Subdomain.elb}.${domainName}`,
      ],
      certificate,
      priceClass: PriceClass.PRICE_CLASS_100, // Use Edge Locations only in USA, Canada, Europe, & Israel
    })

    const rootRecord = new ARecord(this, `${appId}Site`, {
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      zone: hostedZone,
    })

    const wwwRecord = new CnameRecord(this, `${appId}WwwSite`, {
      recordName: `${Subdomain.www}.${domainName}`,
      domainName,
      zone: hostedZone,
    })
  }
}
