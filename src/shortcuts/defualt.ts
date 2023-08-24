import { Shortcut } from './index.d';

export default [
    // -- File menu shortcuts
    {
        id: 'file-save',
        key: ['control', 's'],
    },
    {
        id: 'file-load',
        key: ['control', 'l'],
    },
    {
        id: 'file-new',
        key: ['control', 'n'],
    },
    {
        id: 'file-list',
        key: ['control', 'j'],
    },
    {
        id: 'file-export',
        key: ['control', 'e'],
    },
    {
        id: 'file-import',
        key: ['control', 'i'],
    },


    // -- View menu shortcuts
    {
        id: 'view-zoom-in',
        key: ['control', '='],
    },
    {
        id: 'view-zoom-out',
        key: ['control', '-'],
    },
    {
        id: 'view-fullscreen',
        key: ['F11'],
    },
    {
        id: 'view-theme',
        key: ['control', 't'],
    },


    // -- Pattern menu shortcuts
    {
        id: 'pattern-load',
        key: ['control', 'p', 'l', 'o'],
    },
    {
        id: 'pattern-new',
        key: ['control', 'p', 'n'],
    },
    {
        id: 'pattern-list',
        key: ['control', 'p', 'j'],
    },

    // -- Help menu shortcuts
    {
        id: 'help-about',
        key: [],
    },
    {
        id: 'about',
        key: ['F1'],
    },


    // -- DEV
    {
        id: 'dev-serilize-x',
        key: ['control', 'shift', 'x'],
    },

    {
        id: 'dev-serilize-y',
        key: ['control', 'shift', 'y'],
    },

] as  Array<Shortcut>;