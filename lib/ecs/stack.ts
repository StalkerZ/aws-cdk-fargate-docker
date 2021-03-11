import { ICertificate } from '@aws-cdk/aws-certificatemanager'
import { Port, Vpc } from '@aws-cdk/aws-ec2'
import {
  AwsLogDriver,
  Cluster,
  ContainerImage,
  FargateService,
  FargateTaskDefinition,
  ListenerConfig,
  Secret as EcsSecret,
} from '@aws-cdk/aws-ecs'
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  CfnListener,
  IApplicationLoadBalancer,
} from '@aws-cdk/aws-elasticloadbalancingv2'
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { ARecord, IHostedZone, RecordTarget } from '@aws-cdk/aws-route53'
import { LoadBalancerTarget } from '@aws-cdk/aws-route53-targets'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import { App, Stack } from '@aws-cdk/core'
import config from '../common/config'
import { CommonStackProps } from '../common/stack'
import { Subdomain } from '../common/domain'

interface ECSStackProps extends CommonStackProps {
  vpc: Vpc
  image: ContainerImage
  certificate: ICertificate
  hostedZone: IHostedZone
}

export class ECSStack extends Stack {
  readonly loadBalancer: IApplicationLoadBalancer

  constructor(scope: App, id: string, props: ECSStackProps) {
    super(scope, id, props)

    const { appId, vpc, image, certificate, hostedZone } = props

    const {
      dns: { domainName },
      containerPort,
      appSecretArn,
    } = config

    const cluster = new Cluster(this, `${appId}Cluster`, { vpc })

    // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html
    /*const taskRole = new Role(this, `${appId}EcsTaskRole`, {
      roleName: `${appId}ECSTaskRole`,
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy'
        ),
      ],
    })*/

    const appSecret = Secret.fromSecretCompleteArn(
      this,
      `${appId}Secret`,
      appSecretArn
    )

    // appSecret.grantRead(taskRole)

    const taskDefinition = new FargateTaskDefinition(
      this,
      `${appId}TaskDefinition`,
      {
        //taskRole,
        memoryLimitMiB: 1024, // default 512, has to be raised for create-react-app container
      }
    )

    taskDefinition
      .addContainer(`${appId}Container`, {
        image,
        secrets: {
          REACT_APP_SECRET: EcsSecret.fromSecretsManager(
            appSecret,
            'secretKey'
          ),
        },
        environment: {
          REACT_APP_ENV_VAR: 'This is an env variable',
        },
        logging: new AwsLogDriver({ streamPrefix: `${appId}` }),
      })
      .addPortMappings({
        containerPort,
      })

    const fargateService = new FargateService(this, `${appId}FargateService`, {
      cluster,
      taskDefinition,
    })

    const loadBalancerName = `${appId}ApplicationLoadBalancer`
    this.loadBalancer = new ApplicationLoadBalancer(this, loadBalancerName, {
      vpc,
      internetFacing: true,
      loadBalancerName,
    })

    this.loadBalancer.connections.allowFromAnyIpv4(Port.tcp(80))

    new CfnListener(this, `${id}HttpToHttpsRedirect`, {
      defaultActions: [
        {
          type: 'redirect',
          redirectConfig: {
            statusCode: 'HTTP_301',
            protocol: 'HTTPS',
            port: '443',
          },
        },
      ],
      loadBalancerArn: this.loadBalancer.loadBalancerArn,
      port: 80,
      protocol: 'HTTP',
    })

    const listener = this.loadBalancer.addListener(`${id}HttpsListener`, {
      port: 443,
      certificateArns: [certificate.certificateArn],
    })

    fargateService.registerLoadBalancerTargets({
      containerName: `${appId}Container`,
      containerPort,
      newTargetGroupId: `${appId}TargetGroup`,
      listener: ListenerConfig.applicationListener(listener, {
        protocol: ApplicationProtocol.HTTP,
        healthCheck: {
          enabled: true,
          unhealthyThresholdCount: 3,
        },
      }),
    })

    const wwwElbRecord = new ARecord(this, `${appId}WwwElb`, {
      recordName: `${Subdomain.elb}.${domainName}`,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(this.loadBalancer)),
      zone: hostedZone,
    })
  }
}
