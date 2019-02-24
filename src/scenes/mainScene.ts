
import { preload as _preload, setUpAnimations as _setUpAnimations } from '../preload';
import { EventContext } from '../Utils';
import { CardButton } from '../UI/CardButton';
import { ItemSlot } from '../world/Item';

import { config, ISolidBlockDef, IMiningItemDef, IBlockItemDef, IItemSlot, ITrapEnemyDef } from '../config';
import { GM } from '../GM';
import { Player } from '../world/Player';
import { CellWorld, Cell } from '../world/CellWorld';
import { Entity, DropEntity, EnemyEntity } from '../world/Entity';
import { PlaceBlockUI } from '../UI/PlaceBlockUI';
import { DropItemUI } from '../UI/DropItemUI';

type Pointer = Phaser.Input.Pointer;
type Container = Phaser.GameObjects.Container;
type Graphics = Phaser.GameObjects.Graphics;
type GameObject = Phaser.GameObjects.GameObject;
type Sprite = Phaser.GameObjects.Sprite;
type Point = Phaser.Geom.Point;

interface IMoveKeys {
    down: Phaser.Input.Keyboard.Key,
    up: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key,
    left: Phaser.Input.Keyboard.Key,
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
    private placeBlockUI: PlaceBlockUI;
    private dropItemUI: DropItemUI;
    public view: Container;

    private bg: Phaser.GameObjects.Image;
    cellWorld: CellWorld;
    private cellContainerBuffer: Container[] = [];
    private playerContainer: Container;
    public viewportX: number = 0;
    public viewportY: number = 0;
    player: Player;
    joyStickArea: Graphics;
    slotButtons: CardButton[];
    playerSprite: Sprite;

    public inputLock: string[] = [];
    private viewIsDirty: string[] = [];
    get canInput() {
        return this.inputLock.length === 0;
    }
    public inputQueue = {
        direction: { x: 0, y: 0 },
        slotInput: -1,
    };

    get _entities() {
        return Entity.getAllEntities();
    }

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

        this.cellWorld = new CellWorld(this, config.worldCellWidth, config.worldCellHeight);

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
        this.player.on(Player.onItemUpdated, (slotID: integer) => this.updateSlotButton(slotID));
        this.player.on(Player.onActiveUpdated, (slotID: integer) => {
            this.deactivateSlotButtons();
            this.placeBlockUI.disable();
            if (slotID !== -1) {
                this.updateSlotButton(slotID);

                const targetSlot = this.player.slots[slotID];
                if (targetSlot.itemDef.types.includes('block')) {
                    this.placeBlockUI.enable(this.player, this.viewportX, this.viewportY, targetSlot);
                }
            }
        });

        this.playerContainer = this.add.container(0, 0, [
            this.playerSprite = this.add.sprite(
                config.spriteWidth / 2,
                config.spriteHeight / 2 + 9,
                'platformercharacters_Player'
            )
                .play('player_idle')
        ]);


        let blockMap = config.map.blockMap;
        let sheetMap: { values: string[][] } = null;
        if (config.map.useSheetMap && (sheetMap = this.sys.cache.json.get('sheetMap'))) {
            blockMap = sheetMap.values.map((rows) => rows.map(val => (val.startsWith('$') || val.startsWith('!')) ? val : Number(val)));
        }
        this.cellWorld.loadWorld(blockMap);
        this.initPlayer(this.cellWorld.midWidth, 0);
        this.initView();
        this.updateCells();
        this.animatePlayer();
        this.createSlotButtons();
        this.createJoystick();
        this.createPlaceBlockUI();
        this.createDropItemUI(this.player);

        this.startGame();
    }

    startGame() {
        config.player.inventory.slots.forEach((a: IItemSlot, i) => {
            const { item, level, itemCount } = a;
            this.player.addItem(item, level, itemCount);
            this.updateSlotButton(i);
        })
        this.player.changeActiveSlot(config.player.inventory.activeSlot);
        this.player.initHP(config.player.hp);
    }

    update(time: number, delta: number): void {
        if (this.canInput) {
            this.onInputLockUpdated();
            this.doViewUpdate();
            const playerNeedMove = (
                this.player.oldCellX !== this.player.cellX ||
                this.player.oldCellY !== this.player.cellY
            );
            if (!playerNeedMove) {
                this.playerSprite.play('player_idle');
            }
        }
    }

    doViewUpdate() {
        if (this.viewIsDirty.length > 0) {
            console.log(`doViewUpdate(reasons:[${this.viewIsDirty.join(',')}])`);

            this.viewIsDirty = [];
            this.updateCells();
            this.animatePlayer();
        }
    }

    onInputLockUpdated() {
        if (!this.canInput) {
            this.doViewUpdate();
            return;
        }

        this.checkEntityAndInteract();
        if (!this.canInput) {
            this.doViewUpdate();
            return;
        }

        this.player.oldCellX = this.player.cellX;
        this.player.oldCellY = this.player.cellY;

        this.checkFootholdAndFall();
        if (!this.canInput) {
            this.doViewUpdate();
            return;
        }

        if (this.inputQueue.direction.x !== 0 || this.inputQueue.direction.y !== 0) {
            this.movePlayer(this.inputQueue.direction.x, this.inputQueue.direction.y);
        }
        if (this.inputQueue.slotInput !== -1) {
            this.triggerSlot(this.inputQueue.slotInput);
            this.inputQueue.slotInput = -1;
        }
        this.doViewUpdate();
    }

    addInputLock(reason: string) {
        this.inputLock.push(reason);
        console.log(`addInputLock(reason: ${reason}), ${this.inputLock.length}`);
    }

    removeInputLock(reason: string) {
        this.inputLock.splice(this.inputLock.indexOf(reason), 1);
        console.log(`removeInputLock(reason: ${reason}), ${this.inputLock.length}`);
        this.onInputLockUpdated();
    }

    createSlotButtons() {
        const padding = 4;
        const w = (this.sys.canvas.width - padding * 4) / 4;
        const h = 128;

        this.buttonContainer = this.add.container(0, this.sys.canvas.height - h);

        this.slotButtons = new Array(4).fill(1).map((_, i) => {
            return (new CardButton(
                this, i,
                0 + padding + w / 2 + (w + padding) * i, - padding + h / 2,
                w, h,
                () => this.onSlotButtonPressed(i),
                (droppedZoneID: number) => this.onItemDragDropped(i, droppedZoneID)
            ));
        });
        this.buttonContainer.add(this.slotButtons);
    }

    deactivateSlotButtons() {
        this.slotButtons.forEach((btn) => btn.updateButtonActive(false));
    }

    updateSlotButton(slotID: integer) {
        this.player.slots[slotID].updateButton(this.slotButtons[slotID]);
    }

    onSlotButtonPressed(slotID: integer) {
        this.inputQueue.slotInput = slotID;
    }

    triggerSlot(slotID: integer) {
        this.player.toggleActiveSlot(slotID);
    }

    onItemDragDropped(from: integer, to: integer) {
        console.log('onItemDragDropped', from, to);
        if (from === -1) {
            const toSlot = this.player.slots[to];

        }
        const fromSlot: ItemSlot = (from === -1 ? this.player.tempDrop.slot : this.player.slots[from]);
        const toSlot: ItemSlot = (to === -1 ? this.player.tempDrop.slot : this.player.slots[to]);
        if (fromSlot === toSlot) {
            return;
        }

        if (from === -1 && to !== -1) { // pick up item
            const fromEntity = this.player.tempDrop;
            const toSlot = this.player.slots[to];
            this.player.addItemToSlotOrSwap(fromEntity, to);
        }

        if (from !== -1 && to === -1) { // pick up item
            const fromSlot = this.player.slots[to];
            const toEntity = this.player.tempDrop;
            this.player.dropItemOrSwap(from, toEntity);
        }

        this.viewIsDirty.push('onItemDragDropped');
        // const _slot = fromSlot.clone();
        // fromSlot.
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
            this.joyStickArea.strokeCircle(localX, localY, config.controls.swipeThumbSize);

        });
        this.input.on('pointerup', (pointer: Pointer, sprite: Sprite) => {
            // console.log('pointerup', pointer, localX, localY, evt);
            const { upX, upY } = pointer;
            const startX = this.buttonContainer.getData('startX');
            const startY = this.buttonContainer.getData('startY');
            if (!startX) return;

            this.queueMovePlayer(0, 0);

            this.buttonContainer.setData('startX', null);
            this.buttonContainer.setData('startY', null);
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
            // this.joyStickArea.lineBetween(
            //     startX,
            //     startY,
            //     fingerX,
            //     fingerY
            // );
            this.joyStickArea.strokeCircle(startX, startY, config.controls.minSwipeDist);
            this.joyStickArea.strokeCircle(fingerX, fingerY, config.controls.swipeThumbSize);
            if (dist < config.controls.minSwipeDist) {
            } else {
                const a = {
                    0: { x: 1, y: 0 },
                    1: { x: 0, y: 1 },
                    2: { x: -1, y: 0 },
                    3: { x: 0, y: -1 },
                };
                const delta: { x: number, y: number } = a[dir];
                this.queueMovePlayer(delta.x, delta.y);
            }
        });

        // this.joyStickArea.clear();
        // this.joyStickArea.fillStyle(0xfcfcf9, 1);
        // this.joyStickArea.strokeRoundedRect(0, 0, w, h, 4);
        // this.joyStickArea.fillRoundedRect(0, 0, w, h, 4);

    }

    createPlaceBlockUI() {
        this.placeBlockUI = new PlaceBlockUI(this, this.cellWorld);
        this.placeBlockUI.on(PlaceBlockUI.onDirectionChosen, (direction: Point) => {

            const { x: dx, y: dy } = direction;
            const targetSlot = this.player.getActiveSlot();
            if (targetSlot.itemDef.types.includes('block')) {
                const blockID = (<IBlockItemDef>targetSlot.itemDef).block.builds;
                const cell = this.cellWorld.getCell(this.player.cellX + dx, this.player.cellY + dy);
                const success = this.tryAddBlock(cell, blockID);
                if (success) {
                    this.player.consumeItem(this.player.activeSlotID);
                    this.viewIsDirty.push('PlaceBlockUI.onDirectionChosen');
                }
            } else {
            }
        })
        this.add.existing(this.placeBlockUI);
    }

    createDropItemUI(player: Player) {
        this.dropItemUI = new DropItemUI(this);

        player.on(Player.onTempSlotUpdated, () => {
            if (player.tempDrop) {
                this.dropItemUI.enable(player.tempDrop);
                this.dropItemUI.button.toggleDrag(true);
                this.slotButtons.forEach((button) => button.toggleDrag(true));
            } else {
                this.dropItemUI.disable();
                this.dropItemUI.button.toggleDrag(false);
                this.slotButtons.forEach((button) => button.toggleDrag(false));
            }
        });
        this.add.existing(this.dropItemUI);
        this.dropItemUI.disable();
    }

    queueMovePlayer(dx: integer, dy: integer) {
        this.inputQueue.direction.x = dx;
        this.inputQueue.direction.y = dy;
    }

    movePlayer(dx: integer, dy: integer) {
        // console.log(`movePlayer(${dx}, ${dy})`, new Error());

        let newCellX = Phaser.Math.Clamp(this.player.cellX + dx, 0, this.cellWorld.width - 1);
        let newCellY = Phaser.Math.Clamp(this.player.cellY + dy, 0, this.cellWorld.height - 1);

        let destCell = this.cellWorld.getCell(newCellX, newCellY);
        if (newCellX === this.player.cellX && newCellY === this.player.cellY) {
            // do something if touch world boundary or decided to not move
        } else if (destCell) {
            // interact with cell
            const activeItem = this.player.getActiveSlot();
            let worldChanged = false;
            let canMove = true;

            if (destCell.physicsType === 'solid') {
                if (activeItem && activeItem.itemDef.types.includes('mining')) {
                    worldChanged = this.tryDigCell(destCell, this.player, activeItem);
                }
            }

            destCell = this.cellWorld.getCell(newCellX, newCellY);

            if (destCell.physicsType === 'solid') {
                canMove = false;
                if (dx !== 0 && dy === 0) {
                    console.log('tryClimbStairs');
                    const diagCell = this.cellWorld.getCell(newCellX, newCellY - 1);
                    const aboveCell = this.cellWorld.getCell(this.player.cellX, this.player.cellY - 1);
                    if (diagCell && diagCell.physicsType !== 'solid' && aboveCell && aboveCell.physicsType !== 'solid') {
                        newCellY = newCellY - 1;
                        canMove = true;
                    }
                }
            }
            if (!canMove) {
                newCellX = this.player.cellX;
                newCellY = this.player.cellY;
            } else {
                this.checkTempSlotAndDrop();
            }
        }

        this.player.cellX = newCellX;
        this.player.cellY = newCellY;

        if (!(this.player.oldCellX === this.player.cellX && this.player.oldCellY === this.player.cellY)) {
            this.viewIsDirty.push('movePlayer');
            this.animatePlayer();
        }
    }

    checkEntityAndInteract() {
        const playerCell = this.cellWorld.getCell(this.player.cellX, this.player.cellY);
        if (playerCell.entityStack.length > 0) {
            playerCell.entityStack.forEach((entityID) => {
                const entity = Entity.getEntityByID(entityID);
                if (entity.type === 'drop') {
                    const dropEntity = entity as DropEntity;
                    // this.player.addItem(drop.item, drop.level, drop.itemCount);
                    playerCell.removeEntity(entity);
                    entity.setVisible(false);
                    this.player.setTempSlot(dropEntity);
                    // Entity.destroyEntity(entity);
                } else if (entity.type === 'enemy') {
                    const enemyEntity = entity as EnemyEntity;
                    switch (enemyEntity.enemyType) {
                        case 'trap': {
                            const trap = (enemyEntity.enemyDef as ITrapEnemyDef).trap;
                            const { damage } = trap;

                            this.player.takeDamage(damage);
                            playerCell.removeEntity(entity);
                            Entity.destroyEntity(enemyEntity);
                        } break;
                    }
                }
            });
        }
    }

    checkFootholdAndFall() {
        const belowCell = this.cellWorld.getCell(this.player.cellX, this.player.cellY + 1);
        if (belowCell.physicsType === 'air' || belowCell.physicsType === 'entity') {
            this.movePlayer(0, 1);
        }
    }

    checkTempSlotAndDrop() {
        const playerCell = this.cellWorld.getCell(this.player.cellX, this.player.cellY);
        if (this.player.tempDrop !== null) {
            playerCell.addEntity(this.player.tempDrop);
            this.player.tempDrop.setVisible(true);
            this.player.setTempSlot(null);
        }
    }

    tryDigCell(cell: Cell, player: Player, activeItem: ItemSlot): boolean {

        let worldChanged = false;
        const blockType = cell.getTopBlock();
        const blockDef = config.blocks[blockType];
        console.log('tryDigCell', blockDef.type);
        if (blockDef.type === 'solid') {
            // compare strength
            const blockStrength = (<ISolidBlockDef>blockDef).solid.strength;
            const itemMiningDef = (<IMiningItemDef>activeItem.itemDef).mining;
            const itemStrength = itemMiningDef.strength[activeItem.level];
            if (blockStrength <= itemStrength) {
                cell.removeTopBlock();
                worldChanged = true;

                if (blockStrength === itemStrength) {
                    player.consumeItem(this.player.activeSlotID);
                }
            }
        }

        if (worldChanged) {
            this.viewIsDirty.push('tryDigCell');
        }
        return worldChanged;
    }

    tryAddBlock(cell: Cell, blockID: integer): boolean {
        // const blockDef: IBlockDef;
        if (cell.physicsType !== 'air') return false;
        cell.addBlock(blockID);
        return true;
    }
    initPlayer(cellX: integer, cellY: integer) {
        this.player.oldCellX = this.player.cellX = cellX;
        this.player.oldCellY = this.player.cellY = cellY;

        this.viewportX = Phaser.Math.Clamp(this.player.cellX + config.viewLeft, 0, this.cellWorld.width - config.viewWidth);
        this.viewportY = Phaser.Math.Clamp(this.player.cellY + config.viewTop, 0, this.cellWorld.height - config.viewHeight);

        this.playerContainer.x = config.spriteWidth * (this.player.cellX - this.viewportX);
        this.playerContainer.y = config.spriteHeight * (this.player.cellY - this.viewportY);

    }
    animatePlayer(): void {
        const playerNeedMove = (
            this.player.oldCellX !== this.player.cellX ||
            this.player.oldCellY !== this.player.cellY
        );
        if (playerNeedMove) {
            this.add.tween({
                targets: [this.playerContainer],
                x: config.spriteWidth * (this.player.cellX - this.viewportX),
                y: config.spriteHeight * (this.player.cellY - this.viewportY),
                duration: config.movementTweenSpeed,
                ease: 'Linear',
                onStart: () => {
                    this.playerSprite.play('player_walk');
                },
                onComplete: () => {
                    this.removeInputLock('animatePlayer');
                },
            });
            this.addInputLock('animatePlayer');

        }
    }

    initView() {
        this.view.x = -(config.spriteWidth * this.viewportX);
        this.view.y = -(config.spriteHeight * this.viewportY);
    }

    async updateCells() {
        const viewportX = Phaser.Math.Clamp(this.player.cellX + config.viewLeft, 0, this.cellWorld.width - config.viewWidth);
        const viewportY = Phaser.Math.Clamp(this.player.cellY + config.viewTop, 0, this.cellWorld.height - config.viewHeight);

        const viewCells = this.cellWorld.getCells(viewportX, viewportY, config.viewWidth, config.viewHeight);
        viewCells.forEach((col, xx) => {
            col.forEach((cell, yy) => this.updateCell(cell, viewportX + xx, viewportY + yy));
        });

        this.viewportX = viewportX;
        this.viewportY = viewportY;

        const activeSlot = this.player.getActiveSlot();;
        if (this.placeBlockUI && activeSlot && activeSlot.itemDef.types.includes('block')) {
            this.placeBlockUI.updateButtons(this.player, this.viewportX, this.viewportY, this.player.getActiveSlot());
        }


        const playerNeedMove = (
            this.player.oldCellX !== this.player.cellX ||
            this.player.oldCellY !== this.player.cellY
        );
        if (playerNeedMove) {
            this.addInputLock('tweenView');
            await this.tweenView(this.viewportX, this.viewportY);
            this.removeInputLock('tweenView');
        }
    }
    updateCell(cell: Cell, xx: number, yy: number): void {
        const { cellID: id, stack, name } = cell;
        const bufferedCellContainer = this.cellContainerBuffer.find(c => c.getData('id') === id);
        if (bufferedCellContainer) {
            (bufferedCellContainer
                .removeAll(true)
                .add(stack.map((blockID) => {
                    const { name, key, frame } = config.blocks[blockID];
                    if (key === '') return null;
                    return (this.add.image(0, 0, key, frame)
                        .setOrigin(0)
                    );
                }).filter(a => !!a))
            );
        } else {
            const cellContainer = this.add.container(
                config.spriteWidth * xx,
                config.spriteHeight * yy,
                stack.map((blockID) => {
                    const { key, frame } = config.blocks[blockID];
                    if (key === '') return null;
                    return (this.add.image(0, 0, key, frame)
                        .setOrigin(0)
                    );
                }).filter(a => !!a)
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
                ease: 'Linear',
                onComplete: () => resolve()
            });
        });

    }


    onInputNoAction(dist: number, angle: number, dir: integer) {

    }

    onInputMove(dist: number, angle: number, dir: 0 | 1 | 2 | 3) {
    }

    // private registerKeyboard(): void {
    //     // Creates object for input with WASD keys
    //     this.moveKeys = this.input.keyboard.addKeys({
    //         'up': Phaser.Input.Keyboard.KeyCodes.W,
    //         'down': Phaser.Input.Keyboard.KeyCodes.S,
    //         'left': Phaser.Input.Keyboard.KeyCodes.A,
    //         'right': Phaser.Input.Keyboard.KeyCodes.D
    //     }) as IMoveKeys;


    //     // Stops player acceleration on up press of WASD keys
    //     this.input.keyboard.on('keyup_W', (event: any) => {
    //         if (this.moveKeys.down.isUp) {
    //             // this.plane.setAccelerationY(0);
    //         }
    //     });
    //     this.input.keyboard.on('keyup_S', (event: any) => {
    //         if (this.moveKeys.up.isUp) {
    //             // this.plane.setAccelerationY(0);
    //         }
    //     });
    //     this.input.keyboard.on('keyup_A', (event: any) => {
    //         if (this.moveKeys.right.isUp) {
    //             // this.plane.setAccelerationX(0);
    //         }
    //     });
    //     this.input.keyboard.on('keyup_D', (event: any) => {
    //         if (this.moveKeys.left.isUp) {
    //             // this.plane.setAccelerationX(0);
    //         }
    //     });
    // }

    // private registerMouse(): void {
    //     this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    //     });
    //     this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    //     });
    // }

    // private requestFullscreen() {
    //     const fullscreenName = this.sys.game.device.fullscreen.request;
    //     if (fullscreenName) {
    //         return (<any>this.sys.canvas)[fullscreenName]();
    //     }
    // }
}
