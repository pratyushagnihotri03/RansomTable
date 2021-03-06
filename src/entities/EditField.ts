import {Table} from "../elements/Table";
import {Cell} from "./Cell";
import {EventManager} from "../utils/EventManager";
import {UUID} from "../utils/UUID";

// declare const $:JQueryStatic;

export class EditField {

    private inputField: any;
    private lastDisabled: number;
    private static DISABLE_TO_ENABLE_TRANSITION_THRESHOLD: number = 300;

    // Margin around the edited field in which it is safely click without disabling the edit mode
    private static SAFE_TO_EDIT_MARGIN: number = 10; // in px

    constructor(cell: Cell) {
        this.load(cell);
    }

    private load(cell: Cell) {
        this.inputField = $("<input>").addClass(Table.CLASSES.input).val(cell.element.text());
    }

    public get() {
        return this.inputField.val();
    }

    public remove() {
        this.inputField.remove();
    }

    public edit(cell: Cell, event: BaseJQueryEventObject) {

        if (cell.readOnly) {
            return;
        }

        if (cell.editMode) {
            return;
        }
        else {
            this.enable(cell, event);

        }
    }

    public disable(event) {
        const cell: Cell = event.data.cell;
        const self: EditField = event.data.self;
        if (self.inBounds(event)) {
            // Clicking on the same cell has to be ignored
            return true;
        }
        let text: string = self.inputField.val();
        cell.element.empty();
        cell.element.text(text);
        cell.content = text;
        cell.editMode = false;
        const container = cell.table.container;
        if (container) {
            container.off("mousedown." + cell.element.attr("id"));
        }

        EventManager.offReturnKey("#" + self.inputField.attr("id"));
        self.lastDisabled = +new Date();
        return false;
    }

    public inBounds(event: {clientX: number, clientY: number , offsetX:number, offsetY:number}) {

        const clientX: number = event.clientX;
        const clientY: number = event.clientY+event.offsetY;
        const element = this.inputField;
        const bounds = element[0].getBoundingClientRect();
        const width: number = bounds.width; //element.width();
        const height: number = bounds.height; //element.height();
        const offset: {top: number, left: number} =bounds;// element.offset();

        return clientX >= offset.left - EditField.SAFE_TO_EDIT_MARGIN && clientX <= offset.left + width + EditField.SAFE_TO_EDIT_MARGIN &&
            clientY >= offset.top - EditField.SAFE_TO_EDIT_MARGIN && clientY <= offset.top + height + EditField.SAFE_TO_EDIT_MARGIN;

    }

    public enable(cell: Cell, event: BaseJQueryEventObject) {
        if (this.lastDisabled && (+new Date()) - this.lastDisabled < EditField.DISABLE_TO_ENABLE_TRANSITION_THRESHOLD) {
            return false;
        }
        cell.cache = cell.element.text();
        cell.element.empty();
        cell.element.append(this.inputField.val(cell.cache));
        cell.editMode = true;
        const container = cell.table.container;

        if (container) {
            container.on("mousedown." + cell.element.attr("id"), {
                self: this,
                cell: cell
            }, this.disable);
        }
        EventManager.onReturnKey("#" + this.inputField.attr("id", UUID.register(this.inputField)).attr("id"), this.disable, {
            self: this,
            cell: cell
        });

        return false;
    }

}