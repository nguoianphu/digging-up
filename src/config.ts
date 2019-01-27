

export type IConfig = {
    spriteWidth: number,
    spriteHeight: number,
    viewWidth: number,
    viewHeight: number,
    movementTweenSpeed: number,
    controls: IUIControls;
    blockMap: number[][],
    blocks: { [x: string]: IBlockDef }
}
interface IBlockDef {
    name: string;
    sprite: string;
    frameName: string;
}

interface IUIControls {
    minSwipeDist: number,
    directionSnaps: integer,
}

const c = require('json-loader!yaml-loader!./config.yml');

export const config = c.config as IConfig;
