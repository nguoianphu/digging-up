import { Slot } from "./Item";
import { ItemTypes } from "../config";


export class Player extends Phaser.Events.EventEmitter {
    public cellX: number = 0;
    public cellY: number = 0;
    public oldCellX: number = 0;
    public oldCellY: number = 0;
    public slots: Slot[] = [];
    public activeSlotID: integer = 0;
    public itemLimit: integer = 4;
    public static onItemUpdated: string = 'onItemUpdated';
    public static onActiveUpdated: string = 'onActiveUpdated';

    constructor() {
        super();
        this.slots = new Array(this.itemLimit).fill(1).map(_ => new Slot(ItemTypes.EMPTY, 0));
    }

    getActiveSlotItem() {
        return this.slots[this.activeSlotID];
    }

    changeActiveSlot(slotID: integer) {
        this.slots[this.activeSlotID].isActive = false;
        this.activeSlotID = slotID;
        this.slots[this.activeSlotID].isActive = true;
        this.emit(Player.onActiveUpdated, this.activeSlotID);
    }

    addItem(itemID: ItemTypes, level: integer, count?: integer): integer {
        const slotID = this.slots.findIndex((item) => item.itemID === ItemTypes.EMPTY || item.itemID === itemID);

        let slot = this.slots[slotID];

        if (slot.itemID === ItemTypes.EMPTY) {
            this.slots[slotID] = new Slot(itemID, level);
            if (count != null) this.slots[slotID].setCount(count);
        } else {
            // found same item in slot
            slot.level = Math.max(slot.level, level);
            if (slot.itemDef.uses !== -1 && count != null) slot.count += count;
        }
        slot = this.slots[slotID];
        slot.count = Math.min(slot.count, slot.itemDef.maxStack);
        this.emit(Player.onItemUpdated, slotID);
        return slotID;
    }

    consumeItem(slotID: integer) {
        this.slots[slotID].count--;
        if (this.slots[slotID].count <= 0 && this.slots[slotID].itemDef.uses !== -1) {
            this.removeItem(slotID, true);
        }
        this.emit(Player.onItemUpdated, slotID);
    }

    removeItem(slotID: integer, isSilent: boolean = false) {
        this.slots[slotID] = new Slot(ItemTypes.EMPTY, 0);
        if (!isSilent) this.emit(Player.onItemUpdated, slotID);
    }
}