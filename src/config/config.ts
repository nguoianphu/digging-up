import { BlockTypes, BlockBehaviorTypes } from "./_BlockTypes";
import { ItemTypes } from "./_ItemTypes";
import { EnemyType, IEnemyDef } from "./_EnemyTypes";
import { ISpriteDef } from "./_BasicTypes";


export type IConfig = {
    worldCellWidth: number,
    worldCellHeight: number,
    spriteWidth: number,
    spriteHeight: number,
    viewWidth: integer,
    viewHeight: integer,
    viewLeft: integer,
    viewTop: integer,
    movementTweenSpeed: number,
    controls: IUIControls;
    player: IPlayerDef;
    map: {
        useSheetMap: boolean;
        blockMap: (number | string)[][],
    }
    blocks: { [x: number]: IBlockDef }
    items: { [x: number]: IItemDef }
    entities: { [x: number]: IEntityDef }
    enemies: { [x: number]: IEnemyDef }
    credits: ICreditEntry[];
}

export interface IPlayerDef {
    hp: integer;

    inventory: {
        activeSlot: integer;
        slots: IItemSlot[];
    }
}

export interface IBlockDef extends ISpriteDef {
    name: string;
    type: BlockBehaviorTypes;
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
    drop: IItemSlot;
}

export interface IItemSlot {
    item: ItemTypes;
    level: integer;
    itemCount?: integer;
}

export interface IChestEntityDef extends IEntityDef {
    chest: IChestEntityDetailDef;
}
interface IChestEntityDetailDef extends ISpriteDef, IItemSlot {
};

export interface IEnemyEntityDef extends IEntityDef {
    enemy: {
        enemyID: integer;
    };
}

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
