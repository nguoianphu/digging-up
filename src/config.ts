

export type IConfig = {
    spriteWidth: number,
    spriteHeight: number,
    movementTweenSpeed: number,
    blockMap: number[][],
    blocks: { [x: string]: IBlockDef }
}
interface IBlockDef {
    name: string;
    sprite: string;
    frameName: string;
}

const c = require('json-loader!yaml-loader!./config.yml');

export const config = c.config as IConfig;
