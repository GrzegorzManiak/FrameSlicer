export interface MenuOption {
    id: string;
    action: () => void;
}

export interface Shortcut {
    id: string;
    clean: string;
    group: string;
    key: Array<string>;
    break?: 'before' | 'after';
}

export interface ShortcutMap {
    [key: string]: ShortcutMap | Array<Shortcut>;
}