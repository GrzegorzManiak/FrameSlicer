export interface MenuOption {
    id: string;
    action: () => void;
}

export interface Shortcut {
    id: string;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    key: Array<string>;
}

export interface ShortcutMap {
    [key: string]: ShortcutMap | Array<Shortcut>;
}