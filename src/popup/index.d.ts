export type PopupButtonType = 
    'ERROR' |
    'WARNING' | 
    'INFO' | 
    'SUCCESS';

export type LockStateFunction = (state: boolean) => void;

export interface PopupButton {
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
    on_close?: () => void;
}