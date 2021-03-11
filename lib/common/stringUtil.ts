/*
  MyApp => my_app
  my_app => my_app
*/
export const toSnakeCase = (value: string) =>
  value
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .join('_')
    .toLowerCase()
    .replace(/^(_)/, '')
