import { bindAll } from 'lodash';


import { EventContext, defaultFont } from '../Utils';
import { CardButton } from '../UI/CardButton';

import { config } from '../config';
import { GM } from '../GM';

type Pointer = Phaser.Input.Pointer;

interface IMoveKeys {
    down: Phaser.Input.Keyboard.Key,
    up: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key,
    left: Phaser.Input.Keyboard.Key,
}

enum cellTypes {
    AIR = 0,
    DIRT = 1,
    STONE = 2,
    ROCK = 3,
}

export class Cell {
    public name = 'cell';
    public id: integer;
    public stack: integer[] = [];
    public type: 'solid' | 'platform' | 'air' = 'solid';
    constructor(name: string = 'structure', id: integer, typeEnum: cellTypes) {
        this.name = name;
        this.id = id;
        switch (typeEnum) {
            case cellTypes.DIRT: {
                this.stack.push(cellTypes.DIRT);
                this.type = 'solid';
            } break;
            case cellTypes.STONE: {
                this.stack.push(cellTypes.STONE);
                this.type = 'solid';
            } break;
            case cellTypes.ROCK: {
                this.stack.push(cellTypes.ROCK);
                this.type = 'solid';
            } break;
        }
    }

    toString() {
        return this.name;
    }
}
export class CellWorld {
    public map: Cell[][];
    width: number;
    height: number;
    midWidth: number;
    constructor(width: number, height: number) {
        let id = 0;
        this.width = width;
        this.height = height;

        this.midWidth = width / 2;

        this.map = new Array(height).fill(1)
            .map((_, i) => new Array(width).fill(1)
                .map((_, j) => new Cell('Cell', id++, config.blockMap[i][j]))
            );
    }

    getTransposedMap(): Cell[][] {
        return this.transpose(this.map);
    }

    transpose(map: any[][]) {
        return map[0].map((col, i) => map.map(row => row[i]));
    }

    getCells(x: integer, y: integer, w: integer, h: integer) {
        return new Array(w).fill(1).map((_, i) => {
            return this.getTransposedMap()[x + i].slice(y, y + h);
        });
    }

    toString() {
        return 'CellWorld';
    }
}


export class MainScene extends Phaser.Scene implements GM {

    private moveKeys: IMoveKeys;
    private group1: Phaser.GameObjects.Container;
    private view: Phaser.GameObjects.Container;

    private bg: Phaser.GameObjects.Image;
    private fullscreenButton: Phaser.GameObjects.Text;
    private group = Phaser.GameObjects.Group;
    cellWorld: CellWorld;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload(): void {
        this.load.image('bg', './assets/publicDomain/paper_texture_cells_light_55327_1280x720.jpg');

        this.load.atlasXML('spritesheet_complete',
            './assets/kenney/platformer-pack-redux-360-assets/spritesheet_complete.png',
            './assets/kenney/platformer-pack-redux-360-assets/spritesheet_complete.xml'
        );
        this.load.atlasXML('spritesheet_items',
            './assets/kenney/voxel-pack/spritesheet_items.png',
            './assets/kenney/voxel-pack/spritesheet_items.xml'
        );
        this.load.atlasXML('spritesheet_items',
            './assets/kenney/voxel-pack/spritesheet_items.png',
            './assets/kenney/voxel-pack/spritesheet_items.xml'
        );
        this.load.atlasXML('spritesheet_tiles',
            './assets/kenney/voxel-pack/spritesheet_tiles.png',
            './assets/kenney/voxel-pack/spritesheet_tiles.xml'
        );
        this.load.spritesheet('platformer_redux',
            './assets/kenney/platformer-art-pixel-redux/spritesheet.png',
            {
                frameWidth: 32,
                // frameHeight:16,
                spacing: 2,
                margin: 0,
                endFrame: 30 * 30,

            }
        );

    }

    create(): void {
        (<any>window).scene = this;

        this.cellWorld = new CellWorld(20, 30);

        this.bg = (
            this.add.tileSprite(
                0, 0,
                Number(this.game.config.width) / 4, Number(this.game.config.height) / 4,
                'spritesheet_tiles', 'redsand'
            )
                .setOrigin(0)
                .setScale(4)
        );
        this.view = this.add.container(0, 0);

        this.updateCells();

        const padding = 4;
        const w = (this.sys.canvas.width - padding * 4) / 4;
        const h = w;

        this.group1 = this.add.container(0, this.sys.canvas.height - h - 2 * padding);

        const btns = new Array(4).fill(1).map((_, i) => {
            return (new CardButton(
                this,
                0 + padding + w / 2 + (w + padding) * i, - padding + h / 2,
                w, h,
                [
                    this.make.text({
                        x: 50, y: 40,
                        text: `x10`,
                        style: {
                            fontSize: 30,
                            color: '#000000',
                            align: 'center',
                            fontFamily: defaultFont,
                        },
                        origin: { x: 0.5, y: 0.5 },
                    }),
                    this.make.text({
                        x: 0, y: 70,
                        text: `hello A${i}`,
                        style: {
                            fontSize: 30,
                            color: '#000000',
                            align: 'center',
                            fontFamily: defaultFont,
                        },
                        origin: { x: 0.5, y: 0.5 },
                    })
                ]
            ));
        });
        this.group1.add(btns);
    }

    update(time: number, delta: number): void {

    }

    updateCells() {
        const viewCells = this.cellWorld.getCells(0, 0, 5, 8);
        viewCells.forEach((col, xx) => {
            col.forEach((cell, yy) => {
                const { id, stack, name } = cell;
                const cellContainer = this.add.container(
                    config.spriteWidth * xx,
                    config.spriteHeight * yy,
                    stack.map((blockID) => {
                        const { name, sprite, frameName } = config.blocks[blockID];
                        return (this.add.image(0, 0, sprite, frameName)
                            .setOrigin(0)
                        );
                    })
                )
                this.view.add(cellContainer)
            });
        });
        
    }

    private registerKeyboard(): void {
        // Creates object for input with WASD kets
        this.moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        }) as IMoveKeys;


        // Stops player acceleration on uppress of WASD keys
        this.input.keyboard.on('keyup_W', (event: any) => {
            if (this.moveKeys.down.isUp) {
                // this.plane.setAccelerationY(0);
            }
        });
        this.input.keyboard.on('keyup_S', (event: any) => {
            if (this.moveKeys.up.isUp) {
                // this.plane.setAccelerationY(0);
            }
        });
        this.input.keyboard.on('keyup_A', (event: any) => {
            if (this.moveKeys.right.isUp) {
                // this.plane.setAccelerationX(0);
            }
        });
        this.input.keyboard.on('keyup_D', (event: any) => {
            if (this.moveKeys.left.isUp) {
                // this.plane.setAccelerationX(0);
            }
        });
    }

    private registerMouse(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        });
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        });
    }

    private requestFullscreen() {
        const fullscreenName = this.sys.game.device.fullscreen.request;
        if (fullscreenName) {
            return (<any>this.sys.canvas)[fullscreenName]();
        }
    }
}
