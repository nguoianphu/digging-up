import { ISpriteDef, IDamage } from "./_BasicTypes";

export enum EnemyType {
    SPIKE = 0,
    SLIME = 1,
}

export type EntityBehavior = 'trap' | 'queue' | 'gravity' | 'move' | 'passiveAttack' | 'faceLeftRight';


export interface IEnemyDef extends ISpriteDef {
    enemyName: string;
    behaviors: EntityBehavior[];
}

///////////////
// Behaviors //
///////////////

export interface IGravityEnemyDef extends IEnemyDef {
    gravity: {
        // simple = fall straight to bottom; 
        // float = fall once per turn, can move in air
        type: 'simple' | 'float';
    }
}

export interface ITrapEnemyDef extends IEnemyDef {
    trap: {
        accuracy: integer; // percentage
        damage: IDamage;
    }
}
export interface IQueueEnemyDef extends IEnemyDef {
    queue: {
        speed: integer; // 0 = no move; +ve = fast; -ve = stunned
    }
}
export interface IMoveEnemyDef extends IEnemyDef {
    move: {
        speed: integer;
    }
}
export interface IPassiveAttackEnemyDef extends IEnemyDef {
    passiveAttack: {
        accuracy: integer; // percentage
        damage: IDamage;
    }
}
export interface IFaceLeftRightEnemyDef extends IEnemyDef {
    faceLeftRight: {
        spriteFacingRight: boolean;
        startFacingRight: boolean;
    }
}


