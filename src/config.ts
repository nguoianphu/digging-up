

export type IConfig = {
    worldCellWidth: number,
    worldCellHeight: number,
    spriteWidth: number,
    spriteHeight: number,
    viewWidth: number,
    viewHeight: number,
    movementTweenSpeed: number,
    controls: IUIControls;
    useSheetMap: boolean;
    blockMap: (number | string)[][],
    blocks: { [x: number]: IBlockDef }
    items: { [x: number]: IItemDef }
    entities: { [x: number]: IEntityDef }
    credits: ICreditEntry[];
}

export interface ISpriteDef {
    key: string;
    frame: string;
    scale?: number;
}

export interface IBlockDef extends ISpriteDef {
    name: string;
    type: 'air' | 'solid' | 'platform';
}

export enum BlockTypes {
    AIR = 0,
    DIRT = 1,
    STONE = 2,
    ROCK = 3,
    OBSIDIAN = 4,
}

export interface ISolidBlockDef extends IBlockDef {
    solid: {
        strength: number;
    }
}

export interface IItemDef {
    name: string;
    types: string[];
    sprites: ISpriteDef[];
    maxStack: number[];
}

export enum ItemTypes {
    EMPTY = 0,
    PICK = 1,
    SWORD = 2,
    WARHAMMER = 3,
    PLATFORM = 4,
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

export interface IBlockItemDef extends IItemDef {
    block: {
        builds: BlockTypes; // block id
    }
}

export interface IEntityDef {
    name: string;
    type: string;
}

export interface IDropEntityDef extends IEntityDef {
    drop: {
        item: integer;
        level: integer;
        itemCount?: integer;
    }
}

export interface IChestEntityDef extends IEntityDef {
    chest: IChestEntityDetailDef;
}
interface IChestEntityDetailDef extends ISpriteDef {
    item: integer;
    level: integer;
    itemCount?: integer;
};

export interface IUIControls {
    swipeThumbSize: number,
    minSwipeDist: number,
    directionSnaps: integer,
}

export interface ICreditEntry {
    title: string;
    names: string[]
}

const c = require('json-loader!yaml-loader!./config.yml');

export const config = c.config as IConfig;
