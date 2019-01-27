

export type IConfig = {
    spriteWidth: number,
    spriteHeight: number,
    viewWidth: number,
    viewHeight: number,
    movementTweenSpeed: number,
    controls: IUIControls;
    blockMap: number[][],
    blocks: { [x: number]: IBlockDef }
    items: { [x: number]: IItemDef }
}

export interface IBlockDef extends ISprite {
    name: string;
    type: 'air' | 'solid' | 'platform';
}

export enum blockTypes {
    AIR = 0,
    DIRT = 1,
    STONE = 2,
    ROCK = 3,
}

export interface ISolidBlockDef extends IBlockDef {
    solid: {
        strength: number;
    }
}

export interface IItemDef {
    name: string;
    types: string[];
    sprites: ISprite[];
    uses: number;
}
export interface ISprite {
    key: string;
    frame: string;
}

export interface IMiningItemDef extends IItemDef {
    mining: {
        strength: number[];
    }
}

export interface IFightingItemDef extends IItemDef {
    fight: {
        strength: number[];
    }
}

export interface IUIControls {
    swipeThumbSize: number,
    minSwipeDist: number,
    directionSnaps: integer,
}

const c = require('json-loader!yaml-loader!./config.yml');

export const config = c.config as IConfig;
