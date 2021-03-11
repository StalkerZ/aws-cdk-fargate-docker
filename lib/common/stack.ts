import { StackProps } from '@aws-cdk/core'

export interface CommonStackProps extends StackProps {
  appId: string
}
