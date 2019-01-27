import { Slot } from "./Item";
import { ItemTypes } from "../config";


export class Player extends Phaser.Events.EventEmitter {
    public cellX: number = 0;
    public cellY: number = 0;
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
        const emptyID = this.slots.findIndex((item) => item.itemID === ItemTypes.EMPTY);
        this.slots[emptyID] = new Slot(itemID, level);
        if (count != null) this.slots[emptyID].setCount(count);
        this.emit(Player.onItemUpdated, emptyID);
        return emptyID;
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