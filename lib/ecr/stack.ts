import { Repository } from '@aws-cdk/aws-ecr'
import { ContainerImage, EcrImage } from '@aws-cdk/aws-ecs'
import { App, RemovalPolicy, Stack } from '@aws-cdk/core'
import config from '../common/config'
import { isDev } from '../common/env'
import { CommonStackProps } from '../common/stack'

export class ECRStack extends Stack {
  readonly image: ContainerImage

  constructor(scope: App, id: string, props: CommonStackProps) {
    super(scope, id, props)

    const { appId } = props
    const { env, imageTag } = config

    const repository = new Repository(this, `${appId}Repository`, {
      repositoryName: `${appId.toLowerCase()}-repository`,
      removalPolicy: isDev(env) ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    })

    this.image = EcrImage.fromEcrRepository(repository, imageTag)
  }
}
