

export interface ISpriteDef {
    key: string;
    frame: string;
    scale?: number;
}

export interface ISpriteLevelsDef {
    sprites: ISpriteDef[];
}


export interface IDamage {
    physical?: number;
    elements?: {
        element: 'fire' | 'ice';
        amount: number;
    }[];
    // undo: undoes enemy position to where it initiate the action
    // displace: displace enemy to opposite direction
    knock?: 'undo' | 'displace';
    stun?: integer; // add how much to fatigue?
}