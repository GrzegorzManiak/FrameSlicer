export type Tool =
    | 'select'
    | 'move'
    | 'anchor-add'
    | 'anchor-remove';

export interface ToolObject {
    active: boolean;
    elem: HTMLDivElement;
    tool: Tool;
}

export interface ToolState {
    lock: boolean;

    current_tool: ToolObject | null;
    started_tool: ToolObject | null;
}