import { ISpriteDef, IDamage } from "./_BasicTypes";

export enum EnemyType {
    SPIKE = 0,
    SLIME = 1,
}


export interface IEnemyDef extends ISpriteDef {
    enemyName: string;
    enemyType: 'trap' | 'queue' | 'move' | 'passiveAttack';
}

///////////////
// Behaviors //
///////////////

export interface ITrapEnemyDef extends IEnemyDef {
    trap: {
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
        damage: IDamage;
    }
}
export interface IFaceLeftRightEnemyDef extends IEnemyDef {
    faceLeftRight: {
        spriteFacingRight: boolean;
        startFacingRight: boolean;
    }
}


