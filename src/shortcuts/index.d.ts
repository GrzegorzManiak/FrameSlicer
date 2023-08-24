export interface MenuOption {
    id: string;
    action: () => void;
}

export interface Shortcut {
    id: string;
    key: Array<string>;
}

export interface ShortcutMap {
    [key: string]: ShortcutMap | Array<Shortcut>;
}