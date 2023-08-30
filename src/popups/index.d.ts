export type PopupButtonType = 
    'ERROR' |
    'WARNING' | 
    'INFO' | 
    'SUCCESS';

export type LockStateFunction = (state: boolean) => void;

export interface PopupButton {
    id: string;
    text: string;
    type: PopupButtonType;
    callback: (lsf: LockStateFunction) => void;
}

export interface Popup {
    title: string;
    message: string;
    buttons: PopupButton[];
    auto_close: boolean;
    close_button: boolean;
    on_close?: (pr: PopupReturns) => void;
    on_open?: (pr: PopupReturns) => void;
}

export interface PopupReturns {
    main_elm: HTMLElement;
    close: () => void;
    lock_button: (state: boolean, name: string) => void;
}