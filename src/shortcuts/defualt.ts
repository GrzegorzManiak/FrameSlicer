import { Shortcut } from './index.d';

export default [
    // -- File menu shortcuts
    {
        id: 'file-save',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['s'],
    },
    {
        id: 'file-load',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['l'],
    },
    {
        id: 'file-new',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['n'],
    },
    {
        id: 'file-list',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['j'],
    },
    {
        id: 'file-export',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['e'],
    },
    {
        id: 'file-import',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['i'],
    },


    // -- View menu shortcuts
    {
        id: 'view-zoom-in',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['='],
    },
    {
        id: 'view-zoom-out',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['-'],
    },
    {
        id: 'view-fullscreen',
        ctrl: false,
        shift: false,
        alt: false,
        key: ['F11'],
    },
    {
        id: 'view-theme',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['t'],
    },


    // -- Pattern menu shortcuts
    {
        id: 'pattern-load',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['p', 'l'],
    },
    {
        id: 'pattern-new',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['p', 'n'],
    },
    {
        id: 'pattern-list',
        ctrl: true,
        shift: false,
        alt: false,
        key: ['p', 'j'],
    },

    // -- Help menu shortcuts
    {
        id: 'help-about',
        ctrl: false,
        shift: false,
        alt: false,
        key: [],
    },
    {
        id: 'about',
        ctrl: false,
        shift: false,
        alt: false,
        key: ['F1'],
    },


    // -- DEV
    {
        id: 'dev-serilize-x',
        ctrl: true,
        shift: true,
        alt: false,
        key: ['x'],
    },

    {
        id: 'dev-serilize-y',
        ctrl: true,
        shift: true,
        alt: false,
        key: ['y'],
    },

] as  Array<Shortcut>;