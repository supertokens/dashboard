import { URL_ROOT } from "./const"

export const getAppUrl = (path: string) => {
  return `${URL_ROOT}${path.startsWith('/') ? '' : '/'}${path}}`
}