import { bindAll } from 'lodash';

import { preload as _preload, setUpAnimations as _setUpAnimations } from '../preload';
import { EventContext, defaultFont } from '../Utils';
import { CardButton } from '../UI/CardButton';

import { config } from '../config';
import { GM } from '../GM';

type Pointer = Phaser.Input.Pointer;
type Container = Phaser.GameObjects.Container;
type Graphics = Phaser.GameObjects.Graphics;
type GameObject = Phaser.GameObjects.GameObject;

interface IMoveKeys {
    down: Phaser.Input.Keyboard.Key,
    up: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key,
    left: Phaser.Input.Keyboard.Key,
}

export class Player {
    public cellX: number = 0;
    public cellY: number = 0;

    constructor() {

    }
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



export function angleToDirection(angle: number, divisions: integer) {
    const TAU = 2 * Math.PI;
    // angle in radian
    if (angle < 0) { angle = TAU + angle; };
    return Math.floor((angle + TAU / divisions / 2) / (TAU / divisions)) % divisions;
}


export class MainScene extends Phaser.Scene implements GM {

    private moveKeys: IMoveKeys;
    private buttonContainer: Container;
    private view: Container;

    private bg: Phaser.GameObjects.Image;
    cellWorld: CellWorld;
    private cellContainerBuffer: Container[] = [];
    private playerContainer: Container;
    public viewportX: number = 0;
    public viewportY: number = 0;
    player: Player;
    joyStickArea: Graphics;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload(): void {
        _preload.call(this);
    }

    create(): void {
        _setUpAnimations.call(this);

        (<any>window).scene = this;

        this.cellWorld = new CellWorld(20, 30);

        // this.viewportX = this.cellWorld.midWidth-2;
        // this.viewportY = 0;
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
        this.player = new Player();

        this.playerContainer = this.add.container(0, 0, [
            this.add.sprite(
                config.spriteWidth / 2,
                config.spriteHeight / 2,
                'platformercharacters_Player'
            )
                .play('allOfPlayer')
        ]);

        this.updateCells();
        this.updatePlayer();
        this.createButtons();
        this.createJoystick();
    }

    update(time: number, delta: number): void {

    }

    createButtons() {
        const padding = 4;
        const w = (this.sys.canvas.width - padding * 4) / 4;
        const h = 128;

        this.buttonContainer = this.add.container(0, this.sys.canvas.height - h);

        const btns = new Array(4).fill(1).map((_, i) => {
            return (new CardButton(
                this,
                0 + padding + w / 2 + (w + padding) * i, - padding + h / 2,
                w, h,
                [
                    this.make.text({
                        x: 50, y: 20,
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
                        x: 0, y: 50,
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
        this.buttonContainer.add(btns);
    }

    createJoystick() {
        const w = this.sys.canvas.width;
        const h = this.sys.canvas.height - 128;

        this.buttonContainer = this.add.container(0, 0, [
            this.joyStickArea = this.add.graphics({
                x: 0, y: 0,
                fillStyle: { color: 0xffffff, alpha: 1 },
                lineStyle: { width: 5, color: 0xAAAAAA, alpha: 1 },
            })
        ]);

        this.joyStickArea.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

        this.joyStickArea.on('pointerdown', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
            // console.log('pointerdown', pointer, localX, localY, evt);
            this.buttonContainer.setData('startX', localX);
            this.buttonContainer.setData('startY', localY);
            this.joyStickArea.clear();
            this.joyStickArea.strokeCircle(localX, localY, config.controls.minSwipeDist);
        });
        this.joyStickArea.on('pointerup', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
            // console.log('pointerup', pointer, localX, localY, evt);
            const startX = this.buttonContainer.getData('startX');
            const startY = this.buttonContainer.getData('startY');

            const dist = Phaser.Math.Distance.Between(startX, startY, localX, localY);
            const angle = Phaser.Math.Angle.BetweenPoints({ x: startX, y: startY }, { x: localX, y: localY });
            const dir = angleToDirection(angle, config.controls.directionSnaps) as 0 | 1 | 2 | 3;

            if (dist < config.controls.minSwipeDist) {
                console.log('pointerup dist', dist);
                this.onInputNoAction(dist, angle, dir);
            } else {
                console.log('pointerup angle', dir);
                this.onInputMove(dist, angle, dir);
            }
            this.joyStickArea.clear();
        });
        this.input.setDraggable(this.joyStickArea);
        this.joyStickArea.on('drag', (pointer: Pointer, dragX: number, dragY: number) => {
            const startX = this.buttonContainer.getData('startX');
            const startY = this.buttonContainer.getData('startY');

            const dist = Phaser.Math.Distance.Between(0, 0, dragX, dragY);
            const angle = Phaser.Math.Angle.BetweenPoints({ x: 0, y: 0 }, { x: dragX, y: dragY });
            const dir = angleToDirection(angle, config.controls.directionSnaps) as 0 | 1 | 2 | 3;
            const fingerX = startX + Math.cos(dir * Math.PI / 2) * dist;
            const fingerY = startY + Math.sin(dir * Math.PI / 2) * dist;
            // console.log('drag', dragX, dragY);
            this.joyStickArea.clear();
            this.joyStickArea.lineBetween(
                startX,
                startY,
                fingerX,
                fingerY
            );
            if (dist < config.controls.minSwipeDist) {
                this.joyStickArea.strokeCircle(startX, startY, config.controls.minSwipeDist);
            } else {
                this.joyStickArea.strokeCircle(fingerX, fingerY, config.controls.minSwipeDist);
            }
        });

        // this.joyStickArea.clear();
        // this.joyStickArea.fillStyle(0xfcfcf9, 1);
        // this.joyStickArea.strokeRoundedRect(0, 0, w, h, 4);
        // this.joyStickArea.fillRoundedRect(0, 0, w, h, 4);

    }

    movePlayer(dx: integer, dy: integer) {
        this.player.cellX = Phaser.Math.Clamp(this.player.cellX + dx, 0, this.cellWorld.width - 1);
        this.player.cellY = Phaser.Math.Clamp(this.player.cellY + dy, 0, this.cellWorld.height - 1);

        this.updateCells();
        this.updatePlayer();
    }

    updatePlayer(): any {
        this.add.tween({
            targets: [this.playerContainer],
            x: config.spriteWidth * (this.player.cellX - this.viewportX),
            y: config.spriteHeight * (this.player.cellY - this.viewportY),
            duration: config.movementTweenSpeed,
        })
    }

    updateCells() {
        const viewportX = Phaser.Math.Clamp(this.player.cellX - 2, 0, this.cellWorld.width - config.viewWidth);
        const viewportY = Phaser.Math.Clamp(this.player.cellY - 3, 0, this.cellWorld.height - config.viewHeight);

        const viewCells = this.cellWorld.getCells(viewportX, viewportY, config.viewWidth, config.viewHeight);
        viewCells.forEach((col, xx) => {
            col.forEach((cell, yy) => this.updateCell(cell, viewportX + xx, viewportY + yy));
        });

        this.viewportX = viewportX;
        this.viewportY = viewportY;
        this.tweenView(this.viewportX, this.viewportY);
    }
    updateCell(cell: Cell, xx: number, yy: number): void {
        const { id, stack, name } = cell;
        const bufferedCellContainer = this.cellContainerBuffer.find(c => c.getData('id') === id);
        if (bufferedCellContainer) {
            // do nothing
        } else {
            const cellContainer = this.add.container(
                config.spriteWidth * xx,
                config.spriteHeight * yy,
                stack.map((blockID) => {
                    const { name, sprite, frameName } = config.blocks[blockID];
                    return (this.add.image(0, 0, sprite, frameName)
                        .setOrigin(0)
                    );
                })
            );
            cellContainer.setData('id', id);
            this.cellContainerBuffer.push(cellContainer);
            this.view.add(cellContainer);
        }
    }
    async tweenView(xx: number, yy: number) {
        await new Promise((resolve, reject) => {
            this.add.tween({
                targets: [this.view],
                x: -(config.spriteWidth * xx),
                y: -(config.spriteHeight * yy),
                duration: config.movementTweenSpeed,
                onComplete: () => resolve()
            });
        });
    }

    onInputNoAction(dist: number, angle: number, dir: integer) {

    }

    onInputMove(dist: number, angle: number, dir: 0 | 1 | 2 | 3) {
        const a = {
            0: { x: 1, y: 0 },
            1: { x: 0, y: 1 },
            2: { x: -1, y: 0 },
            3: { x: 0, y: -1 },
        };
        const delta: { x: number, y: number } = a[dir];

        this.movePlayer(delta.x, delta.y);
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
