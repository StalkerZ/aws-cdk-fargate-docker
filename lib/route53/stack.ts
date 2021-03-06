import { Certificate, ICertificate } from '@aws-cdk/aws-certificatemanager'
import { CnameRecord, HostedZone, IHostedZone } from '@aws-cdk/aws-route53'
import { App, Stack } from '@aws-cdk/core'
import config from '../common/config'
import { CommonStackProps } from '../common/stack'

export class Route53Stack extends Stack {
  readonly hostedZone: IHostedZone
  readonly cloudfrontCertificate: ICertificate
  readonly appCertificate: ICertificate

  constructor(scope: App, id: string, props: CommonStackProps) {
    super(scope, id, props)

    const { appId } = props

    const {
      domainName,
      cloudfrontCertificateArn,
      appCertificateArn,
    } = config.dns

    this.hostedZone = HostedZone.fromLookup(this, `${appId}HostedZone`, {
      domainName,
    })

    this.cloudfrontCertificate = Certificate.fromCertificateArn(
      this,
      `${appId}Certificate`,
      cloudfrontCertificateArn
    )
    this.appCertificate = Certificate.fromCertificateArn(
      this,
      `${appId}AppCertificate`,
      appCertificateArn
    )
  }
}
