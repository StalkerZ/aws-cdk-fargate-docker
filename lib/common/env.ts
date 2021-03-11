import { AppEnv } from './config'

export function isDev(env: AppEnv): boolean {
  return env === AppEnv.DEV
}
