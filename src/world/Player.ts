import { ItemSlot } from "./Item";
import { DropEntity, IQueueEntity } from "./Entity";
import { ItemTypes } from "../config/_ItemTypes";
import { IDamage } from "../config/_BasicTypes";
import { EntityBehavior } from "../config/_EnemyTypes";


export class Player extends Phaser.Events.EventEmitter implements IQueueEntity {
    public lastActionTurnID = -1;
    public fatigue: number = 0;
    public cellX: number = 0;
    public cellY: number = 0;
    public oldCellX: number = 0;
    public oldCellY: number = 0;
    public slots: ItemSlot[] = [];
    public activeSlotID: integer = 0;
    public tempDrop: DropEntity = null;
    public itemLimit: integer = 4;

    public behaviors: EntityBehavior[] = ['queue'];

    public name = 'player';
    public hp: integer;
    public hpMax: integer;

    public static onItemUpdated: string = 'onItemUpdated';
    public static onActiveUpdated: string = 'onActiveUpdated';
    public static onTempSlotUpdated: string = 'onTempSlotUpdated';

    constructor() {
        super();
        this.slots = new Array(this.itemLimit).fill(1).map(_ => new ItemSlot(ItemTypes.EMPTY, 0));
    }

    getActiveSlot() {
        if (this.activeSlotID === -1) return null;
        return this.slots[this.activeSlotID];
    }

    toggleActiveSlot(slotID: integer) {
        if (this.activeSlotID !== -1) {
            this.slots[this.activeSlotID].isActive = false;
        }
        if (this.activeSlotID !== slotID) {
            this.activeSlotID = slotID;
            this.slots[this.activeSlotID].isActive = true;
        } else {
            this.activeSlotID = -1;
        }
        this.emit(Player.onActiveUpdated, this.activeSlotID);
    }

    changeActiveSlot(slotID: integer) {
        this.slots[this.activeSlotID].isActive = false;
        this.activeSlotID = slotID;
        this.slots[this.activeSlotID].isActive = true;
        this.emit(Player.onActiveUpdated, this.activeSlotID);
    }

    addItem(itemID: ItemTypes, level: integer, itemCount?: integer): integer {
        const slotID = this.slots.findIndex((slot) => {
            return (
                slot.itemID === ItemTypes.EMPTY ||
                (slot.itemID === itemID && slot.level === level)
            );
        });

        let slot = this.slots[slotID];

        if (slot.itemID === ItemTypes.EMPTY) {
            this.slots[slotID] = new ItemSlot(itemID, level);
            if (itemCount != null) this.slots[slotID].setCount(itemCount);
        } else {
            // found same item in slot
            slot.level = Math.max(slot.level, level);
            const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
            if (slot.itemDef.maxStack[stackLevel] !== -1 && itemCount != null) slot.itemCount += itemCount;
        }
        slot = this.slots[slotID];
        const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
        slot.itemCount = Math.min(slot.itemCount, slot.itemDef.maxStack[stackLevel]);
        this.emit(Player.onItemUpdated, slotID);
        return slotID;
    }


    addItemToSlotOrSwap(fromEntity: DropEntity, toSlotID: integer): integer {
        let slot = this.slots[toSlotID];

        const dropSlot = fromEntity.slot;
        const { itemID, level, itemCount } = dropSlot;

        if (slot.itemID !== itemID || slot.level !== level) {
            // different item

            const leavingSlot = this.slots[toSlotID].clone();
            this.slots[toSlotID] = dropSlot;

            fromEntity.setSlotAndUpdateGraphics(leavingSlot);
            if (leavingSlot.itemID === ItemTypes.EMPTY) {
                this.tempDrop = null; // remove picked up entity
                fromEntity.destroyEntity();
            }
        } else {
            // found same item in slot

            // slot.level = Math.max(slot.level, level); // no need to upgrade now
            const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
            const maxStack = slot.itemDef.maxStack[stackLevel];
            if (maxStack !== ItemSlot.INFINITE_ITEM_COUNT && itemCount != null) {
                slot.itemCount += itemCount;
            }
            this.tempDrop = null; // remove picked up entity
            fromEntity.destroyEntity();
        }

        slot = this.slots[toSlotID];

        // limit item count to maxStack
        const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
        const maxStack = slot.itemDef.maxStack[stackLevel];
        slot.itemCount = Math.min(slot.itemCount, maxStack);

        this.emit(Player.onItemUpdated, toSlotID);
        this.emit(Player.onTempSlotUpdated);
        return toSlotID;
    }

    dropItemOrSwap(fromSlotID: integer, toEntity: DropEntity) {
        let slot = this.slots[fromSlotID];

        const dropSlot = toEntity.slot;
        const { itemID, level, itemCount } = dropSlot;

        if (slot.itemID !== itemID || slot.level !== level) {
            // different item

            const leavingSlot = this.slots[fromSlotID].clone();
            this.slots[fromSlotID] = dropSlot;

            toEntity.setSlotAndUpdateGraphics(leavingSlot);
            if (leavingSlot.itemID === ItemTypes.EMPTY) {
                this.tempDrop = null; // remove picked up entity
                toEntity.destroyEntity();
            }
        } else {
            // found same item in slot

            // slot.level = Math.max(slot.level, level); // no need to upgrade now
            const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
            const maxStack = slot.itemDef.maxStack[stackLevel];
            if (maxStack !== ItemSlot.INFINITE_ITEM_COUNT && itemCount != null) {
                toEntity.slot.itemCount += itemCount;
            }
            // this.tempDrop = null; // remove picked up entity
            // toEntity.destroyEntity();
            this.removeItem(fromSlotID, true);
        }

        slot = this.slots[fromSlotID];

        // limit item count to maxStack
        const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
        const maxStack = slot.itemDef.maxStack[stackLevel];
        slot.itemCount = Math.min(slot.itemCount, maxStack);

        this.emit(Player.onItemUpdated, fromSlotID);
        this.emit(Player.onTempSlotUpdated);
        return fromSlotID;
    }

    consumeItem(slotID: integer) {
        const slot = this.slots[slotID];
        if (slot.itemCount !== -1) slot.itemCount = Math.max(0, slot.itemCount - 1);
        const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
        if (slot.itemCount == 0 && slot.itemDef.maxStack[stackLevel] !== -1) {
            this.removeItem(slotID, true);
        }
        this.emit(Player.onItemUpdated, slotID);
    }

    removeItem(slotID: integer, isSilent: boolean = false) {
        this.slots[slotID] = new ItemSlot(ItemTypes.EMPTY, 0);
        if (!isSilent) this.emit(Player.onItemUpdated, slotID);
    }

    setTempSlot(dropEntity: DropEntity) {
        this.tempDrop = dropEntity;
        this.emit(Player.onTempSlotUpdated);
    }

    initHP(hpMax: integer) {
        this.hp = this.hpMax = hpMax;
    }

    takeDamage(damage: IDamage) {
        const { physical } = damage;
        this.hp -= physical;
        console.log(`Player taken damage. hp=${this.hp}/${this.hpMax}`);

    }
}
