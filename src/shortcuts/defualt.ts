import { Shortcut } from './index.d';

export default [
    // -- File menu shortcuts
    {
        id: 'file-save',
        clean: 'Save',
        group: 'File',
        key: ['control', 's'],
    },
    {
        id: 'file-load',
        clean: 'Load',
        group: 'File',
        key: ['control', 'l'],
    },
    {
        id: 'file-new',
        clean: 'New',
        group: 'File',
        key: ['control', 'n'],
    },
    {
        id: 'file-list',
        clean: 'List',
        group: 'File',
        key: ['control', 'j'],
    },
    {
        id: 'file-export',
        clean: 'Export',
        group: 'File',
        key: ['control', 'e'],
    },
    {
        id: 'file-import',
        clean: 'Import',
        group: 'File',
        key: ['control', 'i'],
    },


    // -- View menu shortcuts
    {
        id: 'view-zoom-in',
        clean: 'Zoom In',
        group: 'View',
        key: ['control', '='],
    },
    {
        id: 'view-zoom-out',
        clean: 'Zoom Out',
        group: 'View',
        key: ['control', '-'],
    },
    {
        id: 'view-fullscreen',
        clean: 'Fullscreen',
        group: 'View',
        key: ['F11'],
    },
    {
        id: 'view-theme',
        clean: 'Theme',
        group: 'View',
        key: ['control', 't'],
    },


    // -- Pattern menu shortcuts
    {
        id: 'pattern-load',
        clean: 'Load',
        group: 'Pattern',
        key: ['control', 'p', 'l', 'o'],
    },
    {
        id: 'pattern-new',
        clean: 'New',
        group: 'Pattern',
        key: ['control', 'p', 'n'],
    },
    {
        id: 'pattern-list',
        clean: 'List',
        group: 'Pattern',
        key: ['control', 'p', 'j'],
    },

    
    // -- Help menu shortcuts
    {
        id: 'help-about',
        clean: 'About',
        group: 'help',
        key: [],
    },
    {
        id: 'about',
        clean: 'About',
        group: 'help',
        key: ['F1'],
    },


    // -- DEV
    {
        id: 'dev-serilize-x',
        clean: 'Serialize X',
        group: 'Dev',
        key: ['control', 'shift', 'x'],
    },

    {
        id: 'dev-serilize-y',
        clean: 'Serialize Y',
        group: 'Dev',
        key: ['control', 'shift', 'y'],
    },

] as  Array<Shortcut>;