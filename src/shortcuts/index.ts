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
    
    private _key_display: HTMLElement | null = null;
    private _current_keys: HTMLElement | null = null;
    private _closest_shorcuts: HTMLElement | null = null;

    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
    readonly used_modifiers = ['Alt', 'Control', 'Shift'];
    readonly disused_keys = [
        'AltGraph', 'CapsLock', 'FnLock', 
        'Hyper', 'NumLock', 'ScrollLock',
        'OS', 'Super', 'Symbol', 'SymbolLock',
        'Meta', 'Fn'
    ];



    // -- Private constructor to prevent multiple instances
    private constructor() {
        log('INFO', 'Loading shortcuts');
        this._load_shortcuts();
        this._ensure_unique_ids();
        this._construct_shortcut_map();
        this.start_listening();

        this._key_display = document.createElement('div');
        this._current_keys = document.createElement('div');
        this._closest_shorcuts = document.createElement('div');

        this._key_display.setAttribute('id', 'key-display');
        this._current_keys.setAttribute('id', 'current-keys');
        this._closest_shorcuts.setAttribute('id', 'closest-shortcuts');

        document.body.appendChild(this._key_display);
        this._key_display.appendChild(this._current_keys);
        this._key_display.appendChild(this._closest_shorcuts);
        this._render_keys_pressed();

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



    // -- Get the modifier keys (even when no normal keys are pressed)
    private _get_modifier_keys(event: KeyboardEvent) {
        // -- The modifier keys
        const used_modifiers: Array<string> = [];

        const current_key = event.key;
        this.used_modifiers.forEach((modifier) => {
            // -- Check if this is a modifier key
            if (current_key !== modifier) return;

            // -- Check if the modifier is already pressed
            if (this._keys_pressed.includes(modifier)) return;

            // -- Add the modifier to the modifier pressed
            this._keys_pressed.push(modifier);
        });

        // -- Check if any modifiers are pressed
        if (event.ctrlKey) used_modifiers.push('Control');
        if (event.shiftKey) used_modifiers.push('Shift');
        if (event.altKey) used_modifiers.push('Alt');
         

        // -- Add the modifier keys to the modifier pressed
        used_modifiers.forEach((modifier) => {
            // -- Check if the modifier is already pressed
            if (this._keys_pressed.includes(modifier)) return;

            // -- Add the modifier to the modifier pressed
            this._keys_pressed.push(modifier);
        });
    }



    private _keys_pressed: Array<string> = [];
    private _prev_key_string: string | null = null;
    private _handle_key_press(event: KeyboardEvent): void {
     
        // -- Get the modifier keys
        this._get_modifier_keys(event);

        if (
            this._keys_pressed.length === 0 &&
            !event.key.startsWith('F') 
        ) {
            this._keys_pressed = [];
            this._render_keys_pressed();
            return;
        };

  
        // -- Cant be a key thats been pressed before, or a modifier key
        if (
            ![...this.disused_keys, ...this.used_modifiers].includes(event.key) &&
            !this._keys_pressed.includes(event.key.toUpperCase())
        ) this._keys_pressed.push(event.key.toUpperCase());

        // -- Check if the keys have changed
        const key_string = this._keys_pressed.join(' ');
        if (key_string === this._prev_key_string) return;
        this._prev_key_string = key_string;

        // -- Get the shortcut
        let shortcuts: Array<Shortcut> = [];
        let current_map = this._shortcut_map;
        for (let key of this._keys_pressed) {

            // -- Check if the key is in the map
            key = key.toUpperCase();
            if (current_map[key] === undefined) {
                this._keys_pressed = [];
                this._render_keys_pressed();
                return;
            };

            // -- Add the shortcut to the list
            if (Array.isArray(current_map[key])) {
                shortcuts = shortcuts.concat(current_map[key] as Array<Shortcut>);
                break;
            }

            // -- Update the current map
            current_map = current_map[key] as ShortcutMap;
            this._render_keys_pressed(current_map);
        }


        // -- Check if there are any shortcuts
        if (shortcuts.length === 0) return;
        this._keys_pressed = [];
        this._render_keys_pressed();
        shortcuts.forEach((shortcut) => {
            log('INFO', `Shortcut pressed: ${shortcut.id}`);
            if (this._actions[shortcut.id] !== undefined) 
                this._actions[shortcut.id]();
        });
    }



    private _render_keys_pressed(
        map: ShortcutMap | null = null
    ): void {
        // -- Get the pressed keys
        const keys = this._keys_pressed;
        

        // -- Check if there are no keys pressed
        if (keys.length === 0 || map === null) {
            this._key_display.setAttribute('hidden', '');
            this._current_keys.innerHTML = '';
            this._closest_shorcuts.innerHTML = '';
            this._prev_key_string = null;
            return;
        }
        

        // -- Update the key display
        this._key_display.removeAttribute('hidden');
        const elms: Array<HTMLElement> = [];
        this._current_keys.innerHTML = '';
        this._closest_shorcuts.innerHTML = '';


        // -- Add the keys to the key display
        keys.forEach((key) => {
            const elm = document.createElement('div');
            elm.classList.add('key');
            elm.innerText = key;
            elms.push(elm);
            this._current_keys.appendChild(elm);
        });


        // -- Get the closest shortcuts
        const shortcuts = this._get_closest_shortcuts(map);
        shortcuts.forEach((shortcut) => {
            const elm = document.createElement('s-opt'),
                title = document.createElement('p'),
                short = document.createElement('p');
                
            elm.classList.add('shortcut');
            elms.push(elm);

            title.classList.add('title');
            title.innerText = shortcut.id;

            short.classList.add('shortcut');
            short.innerText = this.serialize_shortcut(shortcut);

            elm.appendChild(title);
            elm.appendChild(short);

            this._closest_shorcuts.appendChild(elm);
        });
    }



    private _get_closest_shortcuts(
        map: ShortcutMap,
        amount: number = 4,
    ): Array<Shortcut> {
        const shortcuts: Array<Shortcut> = [];
        
        // -- Check if the map is an array
        if (Array.isArray(map)) {
            for (let i = 0; i < amount; i++) {
                if (map[i] === undefined) continue;
                shortcuts.push(map[i]);
            }
            return shortcuts;
        }

        // -- Get the keys of the map
        const keys = Object.keys(map);
        for (let i = 0; i < amount; i++) {  
            if (keys[i] === undefined) break;
            const entry = map[keys[i]];

            // -- If the entry is a map (object) skip
            if (!Array.isArray(entry)) continue;

            // -- If the entry is an array, add it to the shortcuts
            const need = amount - shortcuts.length;
            for (let j = 0; j < need; j++) {
                if (entry[j] === undefined) continue;
                shortcuts.push(entry[j]);
            }

            // -- If there are enough shortcuts, return them
            if (shortcuts.length === amount) return shortcuts;
        }

        // -- Return the shortcuts
        return shortcuts;
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
        };


        document.addEventListener('keyup', (e) => {
            // -- Clear the keys pressed
            this._keys_pressed = [];
            this._render_keys_pressed();
        });
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
        
        // -- Join the keys
        const keys = shortcut.key.join(' + ');
        serialized += keys.toUpperCase();

        serialized = serialized.replace('CONTROL', 'Ctrl');
        serialized = serialized.replace('SHIFT', 'Shift');
        serialized = serialized.replace('ALT', 'Alt');

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