import { ItemSlot } from "./Item";
import { ItemTypes } from "../config";


export class Player extends Phaser.Events.EventEmitter {
    public cellX: number = 0;
    public cellY: number = 0;
    public oldCellX: number = 0;
    public oldCellY: number = 0;
    public slots: ItemSlot[] = [];
    public activeSlotID: integer = 0;
    public itemLimit: integer = 4;
    public static onItemUpdated: string = 'onItemUpdated';
    public static onActiveUpdated: string = 'onActiveUpdated';

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

    addItem(itemID: ItemTypes, level: integer, count?: integer): integer {
        const slotID = this.slots.findIndex((slot) => {
            return (
                slot.itemID === ItemTypes.EMPTY ||
                (slot.itemID === itemID && slot.level === level)
            );
        });

        let slot = this.slots[slotID];

        if (slot.itemID === ItemTypes.EMPTY) {
            this.slots[slotID] = new ItemSlot(itemID, level);
            if (count != null) this.slots[slotID].setCount(count);
        } else {
            // found same item in slot
            slot.level = Math.max(slot.level, level);
            const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
            if (slot.itemDef.maxStack[stackLevel] !== -1 && count != null) slot.count += count;
        }
        slot = this.slots[slotID];
        const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
        slot.count = Math.min(slot.count, slot.itemDef.maxStack[stackLevel]);
        this.emit(Player.onItemUpdated, slotID);
        return slotID;
    }

    consumeItem(slotID: integer) {
        const slot = this.slots[slotID];
        if (slot.count !== -1) slot.count = Math.max(0, slot.count - 1);
        const stackLevel = Math.min(slot.itemDef.maxStack.length - 1, slot.level);
        if (slot.count == 0 && slot.itemDef.maxStack[stackLevel] !== -1) {
            this.removeItem(slotID, true);
        }
        this.emit(Player.onItemUpdated, slotID);
    }

    removeItem(slotID: integer, isSilent: boolean = false) {
        this.slots[slotID] = new ItemSlot(ItemTypes.EMPTY, 0);
        if (!isSilent) this.emit(Player.onItemUpdated, slotID);
    }
}