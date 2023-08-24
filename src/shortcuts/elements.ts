import { ShortcutMap } from './index.d';
import Shortcuts from '.';



/**
 * @name render_pressed_keys
 * This function renders the set of keys that are currently
 * being pressed
 * 
 * @param {Shortcuts} si - The shortcuts instance
 * @param {Array<string>} keys - The keys that are currently pressed
 * @param {ShortcutMap} map - The shortcut map
 * 
 * @returns {void}
 */
export const render_pressed_keys = (
    si: Shortcuts,
    keys: Array<string> = [],
    map: ShortcutMap | null = null,
): void => {

    // -- Check if there are no keys pressed
    const reset = () => { 
        si._key_display.setAttribute('hidden', '');
        si._current_keys.innerHTML = '';
        si._closest_shorcuts.innerHTML = '';
    }

    // -- Check if rendering is disabled
    if (!si.render_keys) return reset();

    // -- Make sure there are keys to render
    if (keys.length === 0 || map === null) 
        return reset();


    // -- Update the key display
    const elms: Array<HTMLElement> = [];
    si._key_display.removeAttribute('hidden');
    si._current_keys.innerHTML = '';
    si._closest_shorcuts.innerHTML = '';


    // -- Add the keys to the key display
    keys.forEach((key) => {
        const elm = document.createElement('div');
        elm.classList.add('key');
        elm.innerText = key;
        elms.push(elm);
        si._current_keys.appendChild(elm);
    });


    // -- Get the closest shortcuts
    const shortcuts = si._get_closest_shortcuts(map);
    shortcuts.forEach((shortcut) => {
        const elm = document.createElement('s-opt'),
            title = document.createElement('p'),
            short = document.createElement('p');
            
        elm.classList.add('shortcut');
        elms.push(elm);

        title.classList.add('title');
        title.innerText = `${shortcut.group} - ${shortcut.clean}`

        short.classList.add('shortcut');
        short.innerText = si.serialize_shortcut(shortcut);

        elm.appendChild(title);
        elm.appendChild(short);

        si._closest_shorcuts.appendChild(elm);
        elm.onclick = () => {
            // -- Execute the action
            si.execute_action(shortcut.id);

            // -- Clear the keys pressed
            si._keys_pressed = [];
            si._prev_key_string = '';
            reset();
        };
    });
}