

export interface ISpriteDef {
    key: string;
    frame: string;
    scale?: number;
}

export interface ISpriteLevelsDef {
    sprites: ISpriteDef[];
}


export interface IDamage {
    physical: number;
    knock?: string;
}