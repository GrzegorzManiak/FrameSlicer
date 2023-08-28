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
        break: 'after'
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
        break: 'after'
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
        key: ['control', 'p', 'm'],
    },
    {
        id: 'pattern-list',
        clean: 'List',
        group: 'Pattern',
        key: ['control', 'p', 'j'],
    },

    
    // -- Help menu shortcuts
    {
        id: 'help-contact',
        clean: 'Contact',
        group: 'Help',
        key: [],
    },
    {
        id: 'help-about',
        clean: 'About',
        group: 'Help',
        key: ['F1'],
    },
    {
        id: 'help-version',
        clean: 'Version',
        group: 'Help',
        break: 'before',
        key: [],
    },
    {
        id: 'help-licenses',
        clean: 'Licenses',
        group: 'Help',
        key: [],
    },

    // -- Tools
    {
        id: 'tools-select',
        clean: 'Select',
        group: 'Tools',
        key: ['control', 'shift', 's'],
    },

    {
        id: 'tools-move',
        clean: 'Move',
        group: 'Tools',
        key: ['control', 'shift', 'm'],
    },

    {
        id: 'tools-anchor-add',
        clean: 'Add Anchor',
        group: 'Tools',
        key: ['control', 'shift', 'a'],
    },

    {
        id: 'tools-anchor-remove',
        clean: 'Remove Anchor',
        group: 'Tools',
        key: ['control', 'shift', 'f'],
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