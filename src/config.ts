

export type IConfig = {
}


const c = require('json-loader!yaml-loader!./config.yml');

export const config = c.config as IConfig;
