import { bindAll } from 'lodash';


import { EventContext, defaultFont } from '../Utils';
import { CardButton } from '../UI/CardButton';

import { config, ISpriteSpec, IDifficulty, IDifficultyWave } from '../config';
import { GM } from '../GM';

type Pointer = Phaser.Input.Pointer;

interface IMoveKeys {
    down: Phaser.Input.Keyboard.Key,
    up: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key,
    left: Phaser.Input.Keyboard.Key,
}

export const faction1 = ['天', '下', '太', '平'];

export class Structure {
    public name = 'structure';
    constructor(name: string = 'structure') {
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

export class Player {
    public structures: Structure[][];
    public structureDepth: number = 0;
    public faction = faction1;
    public btns: CardButton[] = [];

    build(structureOrName: Structure | string, depth: number = this.structureDepth): void {
        if (typeof structureOrName === 'string') return this.build(new Structure(name), depth);
        const structure: Structure = structureOrName;
        this.structures[depth].push(structure);
    }

    getLevelAt(depth: number): number {
        return this.structures[depth].length;
    }

    advanceDepth(): void {
        this.structureDepth++;
        if (!this.structures[this.structureDepth]) {
            this.structures[this.structureDepth] = [];
        }
    }

    decreaseDepth(): void {
        this.structureDepth--;
    }

    upgradeBase(): void {
        this.build(new Structure(this.faction[this.getLevelAt(0) + 1]), 0);
    }

    canBuild(name: string) {

    }
}

export class MainScene extends Phaser.Scene implements GM {

    private moveKeys: IMoveKeys;
    private player1: Player;
    private player2: Player;
    private group1: Phaser.GameObjects.Container;
    private group2: Phaser.GameObjects.Container;

    private bg: Phaser.GameObjects.Image;
    private fullscreenButton: Phaser.GameObjects.Text;
    private group = Phaser.GameObjects.Group;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload(): void {
        this.load.image('bg', './assets/publicDomain/paper_texture_cells_light_55327_1280x720.jpg');

    }

    create(): void {
        (<any>window).scene = this;

        this.player1 = new Player();
        this.player2 = new Player();

        this.bg = this.add.image(0, 0, 'bg')
            .setAngle(90)
            ;

        const padding = 4;
        const w = (this.sys.canvas.width - padding - padding) / 7;
        const h = w / 0.75;

        this.group1 = this.add.container(this.sys.canvas.width, h);
        this.group1.setAngle(180);
        this.group2 = this.add.container(0, this.sys.canvas.height - h - 2 * padding);

        this.player1.btns = new Array(7).fill(1).map((_, i) => {
            return (new CardButton(
                this,
                0 + padding + w / 2 + w * i, - padding + h / 2,
                w, h,
                [
                    this.make.text({
                        x: 0, y: 0,
                        text: `hello\nA${i}`,
                        style: {
                            color: '#000000',
                            align: 'center',
                            fontFamily: defaultFont,
                        },
                        origin: { x: 0.5, y: 0.5 },
                    })
                ]
            ));
        });
        this.group1.add(this.player1.btns);


        this.player2.btns = new Array(7).fill(1).map((_, i) => {
            return (new CardButton(
                this,
                0 + padding + w / 2 + w * i, 0 + padding + h / 2,
                w, h,
                [
                    this.make.text({
                        x: 0, y: 0,
                        text: `hello\nB${i}`,
                        style: {
                            color: '#000000',
                            align: 'center',
                            fontFamily: defaultFont,
                        },
                        origin: { x: 0.5, y: 0.5 },
                    })
                ]
            ));
        });
        this.group2.add(this.player2.btns);
    }

    update(time: number, delta: number): void {

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
