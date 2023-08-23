import Shortcuts from '../shortcuts';
import { export_menu_prompt } from './export';

// -- Load the shortcuts
const si = Shortcuts.get_instance();

/**
 * @name assign_actions
 * Assigns the actions to most of the shortcuts
 * that can be found in the menu bar
 * 
 * @returns {void}
 */
export const assign_actions = () => {
    // -- Add the shortcut
    si.assign_action('file-export', export_menu_prompt);
};