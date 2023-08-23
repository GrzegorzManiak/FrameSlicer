import { Shortcut, ShortcutMap } from './index.d';
import def_shortcuts from './defualt';
import { log } from '../log';

let _instance: Shortcuts | null = null;
export default class Shortcuts {
    private _shortcuts: Array<Shortcut> = [];
    private _storage_key = 'shortcuts';
    private _shortcut_map: ShortcutMap = {};
    private _actions: Array<{
        [key: string]: () => void;
    }> = [];


    // -- Private constructor to prevent multiple instances
    private constructor() {
        log('INFO', 'Loading shortcuts');
        this._load_shortcuts();
        this._ensure_unique_ids();
        this._construct_shortcut_map();
        this.start_listening();
        log('INFO', 'Shortcuts loaded');
    }

    // -- Encode the shortcuts to a string for storage
    private _encode_shortcuts(): string {
        return JSON.stringify(this._shortcuts);
    }

    // -- Ensure that there are no duplicate ids
    private _ensure_unique_ids(): void {
        const ids: Array<string> = [];
        for (const shortcut of this._shortcuts) {
            if (ids.includes(shortcut.id)) {
                log('ERROR', `Duplicate shortcut id: ${shortcut.id}`);
                shortcut.id = `${shortcut.id}_copy`;
            }
            ids.push(shortcut.id);
        }
    }

    // -- Construct the shortcut map
    private _construct_shortcut_map() {
        // -- Clear the shortcut map
        this._shortcut_map = {};

        // -- Add the shortcuts to the map
        for (const shortcut of this._shortcuts) {
            
            // -- Go trough the keys
            let current_map = this._shortcut_map;
            for (let i = 0; i < shortcut.key.length; i++) {
                // -- Get the key
                const key = shortcut.key[i].toUpperCase();

                // -- Last key
                if (i === shortcut.key.length - 1) {
                    if (current_map[key] === undefined) current_map[key] = [];
                    (current_map[key] as Array<Shortcut>).push(shortcut);
                    continue;
                }

                // -- Not last key
                if (current_map[key] === undefined) current_map[key] = {};
                current_map = current_map[key] as ShortcutMap;
            }
        }
    }
    
    // -- Decode the shortcuts from a string
    private _decode_shortcuts(shortcuts: string): Array<Shortcut> {
        const decoded = JSON.parse(shortcuts);
        let parsed: Array<Shortcut> = [];


        // -- Check if the decoded shortcuts are valid (substitute missing values with defaults)
        for (let i = 0; i < decoded.length; i++) {
            // -- Check if the shortcut is valid
            if (
                decoded[i].id === undefined ||
                decoded[i].ctrl === undefined ||
                decoded[i].shift === undefined ||
                decoded[i].alt === undefined ||
                decoded[i].key === undefined
            ) continue;

            // -- Check if the shortcut has a valid id
            if (this.get_default_shortcut(decoded[i].id) === null) 
                continue;

            // -- Add the shortcut to the parsed array
            parsed.push(decoded[i]);
        }


        // -- Find the missing shortcuts and add them to the parsed array
        const def_ids = def_shortcuts.map((shortcut) => shortcut.id);
        for (const def_id of def_ids) {
            
            // -- Check if the shortcut is already in the parsed array
            const found = parsed.find((shortcut) => shortcut.id === def_id);
            if (found !== undefined) continue;

            // -- Add the shortcut to the parsed array
            log('WARN', `Adding missing shortcut: ${def_id}`);
            parsed.push(this.get_default_shortcut(def_id)!);
        }


        // -- Return the parsed array
        return parsed;
    }

    // -- Load the shortcuts from local storage (if any)
    private _load_shortcuts(): void {
        log('INFO', 'Loading shortcuts from local storage');
        const encoded = localStorage.getItem(this._storage_key);
        if (encoded === null) this._shortcuts = def_shortcuts;
        else this._shortcuts = this._decode_shortcuts(encoded);
        log('INFO', 'Shortcuts loaded from local storage');
    }

    private _keys_pressed: Array<string> = [];
    private _handle_key_press(event: KeyboardEvent): void {
        // -- Check if any modifiers are pressed
        const modifiers: Array<string> = [];
        if (event.ctrlKey) modifiers.push('Ctrl');
        if (event.shiftKey) modifiers.push('Shift');
        if (event.altKey) modifiers.push('Alt');


        // -- Make sure that ctrl | shift | alt are pressed
        //    or that a Fx key is pressed
        if (
            modifiers.length === 0 &&
            !event.key.startsWith('F')
        ) {
            this._keys_pressed = [];
            return;
        };

  
        // -- Add the key to the keys pressed (if not already pressed)
        if (!this._keys_pressed.includes(event.key.toUpperCase()))
            this._keys_pressed.push(event.key.toUpperCase());


        // -- Get the shortcut
        let shortcuts: Array<Shortcut> = [];
        let current_map = this._shortcut_map;
        for (const key of this._keys_pressed) {

            // -- Check if the key is in the map
            if (current_map[key] === undefined) continue;

            // -- Add the shortcut to the list
            if (Array.isArray(current_map[key])) {
                shortcuts = shortcuts.concat(current_map[key] as Array<Shortcut>);
                break;
            }

            // -- Update the current map
            current_map = current_map[key] as ShortcutMap;
        }


        // -- Check if there are any shortcuts with the same modifiers
        const matching_shortcuts = shortcuts.filter((shortcut) => {
            if (shortcut.ctrl !== event.ctrlKey) return false;
            if (shortcut.shift !== event.shiftKey) return false;
            if (shortcut.alt !== event.altKey) return false;
            return true;
        });


        // -- Check if there are any shortcuts
        if (matching_shortcuts.length === 0) return;
        this._keys_pressed = [];
        matching_shortcuts.forEach((shortcut) => {
            log('INFO', `Shortcut pressed: ${shortcut.id}`);
            if (this._actions[shortcut.id] !== undefined) 
                this._actions[shortcut.id]();
        });
    }



    /**
     * @name star_listening
     * Starts listening for keyboard events
     * 
     * @returns {void}
     */
    public start_listening(): void {
        log('INFO', 'Starting shortcut listening');
        document.addEventListener('keydown', 
            this._handle_key_press.bind(this));

        document.onkeydown = function (e) {
            // -- Allow inspect element
            if (
                e.ctrlKey && 
                e.shiftKey && 
                e.key === 'I'
            ) return true;

            // -- Allow reset
            if (
                e.ctrlKey &&
                e.shiftKey &&
                e.key === 'R'
            ) return true;
            
            // -- If its a modifier key, prevent default
            if (
                e.ctrlKey || 
                e.shiftKey || 
                e.altKey
            ) return false
            
            return true;
        }
    }



    /**
     * @name stop_listening
     * Stops listening for keyboard events
     * 
     * @returns {void}
     */
    public stop_listening(): void {
        log('INFO', 'Stopping shortcut listening');
        document.removeEventListener('keydown', 
            this._handle_key_press.bind(this));

        document.onkeydown = function (e) {
            return true;
        }
    }


    /**
     * @name get_instance
     * Get the singleton instance of the Shortcuts class
     * 
     * @returns {Shortcuts} The singleton instance of the Shortcuts class
     */
    public static get_instance(): Shortcuts {
        if (_instance === null) _instance = new Shortcuts();
        return _instance;
    }



    /**
     * @name _get_shortcut
     * internal function to get a shortcut by id
     * 
     * @param {string} id - The id of the shortcut to get
     * @param {Array<Shortcut>} shortcuts - The array of shortcuts to search
     * 
     * @returns {Shortcut | null} The shortcut if found, null otherwise
     */
    private _get_shortcut(id: string, shortcuts: Array<Shortcut>): Shortcut | null {
        for (const shortcut of shortcuts) {
            if (shortcut.id === id) return shortcut;
        }

        // -- Shortcut not found
        return null;
    }



    /**
     * @name get_shortcut
     * Gets a shortcut by id from the current shortcuts
     * 
     * @param {string} id - The id of the shortcut to get
     * 
     * @returns {Shortcut | null} The shortcut if found, null otherwise
     */
    public get_shortcut(id: string): Shortcut | null {
        return this._get_shortcut(id, this._shortcuts);
    }



    /**
     * @name get_default_shortcut
     * Gets a shortcut by id from the default shortcuts
     * 
     * @param {string} id - The id of the shortcut to get
     * 
     * @returns {Shortcut | null} The shortcut if found, null otherwise
     */
    public get_default_shortcut(
        id: string
    ): Shortcut | null {
        return this._get_shortcut(id, def_shortcuts);
    }



    /**
     * @name save_shortcuts
     * Saves the current shortcuts to local storage
     * 
     * @returns {void}
     */
    public save_shortcuts(
    ): void {
        const encoded = this._encode_shortcuts();
        localStorage.setItem(this._storage_key, encoded);
        this._ensure_unique_ids();
        this._construct_shortcut_map();
    }



    /**
     * @name reset_shortcuts
     * Resets the shortcuts to the default shortcuts
     * 
     * @returns {void}
     */
    public reset_shortcuts(
    ): void {
        log('INFO', 'Resetting shortcuts');
        this._shortcuts = def_shortcuts;
        this.save_shortcuts();
    }



    /**
     * @name update_shortcut
     * Updates a shortcut by id
     * 
     * @param {string} id - The id of the shortcut to update
     * @param {Shortcut} shortcut - The new shortcut
     *
     * @returns {void}
     */
    public update_shortcut(
        id: string, 
        shortcut: Shortcut
    ): void {
        // -- Make sure the shortcut is valid
        if (
            shortcut.id === undefined ||
            shortcut.ctrl === undefined ||
            shortcut.shift === undefined ||
            shortcut.alt === undefined ||
            shortcut.key === undefined
        ) {
            log('ERROR', 'Invalid shortcut');
            throw new Error('Invalid shortcut');
        }

        // -- Make sure that the shortcut has the same id
        if (shortcut.id !== id) {
            log('ERROR', 'Shortcut id mismatch');
            throw new Error('Shortcut id mismatch');
        }

        // -- Update the shortcut
        const index = this._shortcuts.findIndex((shortcut) => shortcut.id === id);
        if (index === -1) {
            log('ERROR', 'Shortcut not found');
            throw new Error('Shortcut not found');
        }
        this._shortcuts[index] = shortcut;

        // -- Save the shortcuts
        this.save_shortcuts();
    }



    /**
     * @name serialize_shortcut
     * Serializes a shortcut to a string eg 'Ctrl + Shift + Alt + A'
     * 
     * @param {Shortcut} shortcut - The shortcut to serialize
     * 
     * @returns {string} The serialized shortcut
     */
    public serialize_shortcut(
        shortcut: Shortcut
    ): string {
        let serialized = '';

        // -- Serialize the modifiers
        if (shortcut.ctrl) serialized += 'Ctrl + ';
        if (shortcut.shift) serialized += 'Shift + ';
        if (shortcut.alt) serialized += 'Alt + ';

        // -- Join the keys
        const keys = shortcut.key.join(' + ');
        serialized += keys.toUpperCase();

        // -- Return the serialized shortcut
        return serialized;
    }



    /**
     * @name assign_action
     * Assigns an action to a shortcut
     * 
     * @param {string} id - The id of the shortcut to assign the action to
     * @param {() => void} action - The action to assign
     * 
     * @returns {void}
     */
    public assign_action(
        id: string,
        action: () => void
    ): void {
        this._actions[id] = action;
    }
}