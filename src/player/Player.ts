import { Slot, ItemType } from "./Item";


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
        this.slots = new Array(this.itemLimit).fill(1).map(_ => new Slot(ItemType.EMPTY, 0));
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

    addItem(itemID: ItemType, level: integer, count?: integer): integer {
        const emptyID = this.slots.findIndex((item) => item.itemID === ItemType.EMPTY);
        this.slots[emptyID] = new Slot(itemID, level);
        if (count != null) this.slots[emptyID].setCount(count);
        this.emit(Player.onItemUpdated, emptyID);
        return emptyID;
    }

    removeItem(slotID: integer) {
        this.slots[slotID] = new Slot(ItemType.EMPTY, 0);
        this.emit(Player.onItemUpdated, slotID);
    }
}