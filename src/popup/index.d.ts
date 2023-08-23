export type PopupButtonType = 
    'ERROR' |
    'WARNING' | 
    'INFO' | 
    'SUCCESS';

export interface PopupButton {
    text: string;
    type: PopupButtonType;
    callback: () => void;
}

export interface Popup {
    title: string;
    message: string;
    buttons: PopupButton[];
    auto_close: boolean;
    close_button: boolean;
}