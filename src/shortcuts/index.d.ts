export interface MenuOption {
    id: string;
    action: () => void;
}

export interface Shortcut {
    id: string;
    clean: string;
    group: string;
    key: Array<string>;
}

export interface ShortcutMap {
    [key: string]: ShortcutMap | Array<Shortcut>;
}