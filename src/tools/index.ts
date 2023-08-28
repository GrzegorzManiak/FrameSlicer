import { log } from '../log';
import Shortcuts from '../shortcuts';
import { ToolState } from './index.d';
import { add_listeners, get_active_tool, get_tools, set_state } from './loader';


/**
 * @name load_tools
 * Loads in all the tools allowing
 * for their use
 * 
 * @returns {void} - Nothing
 */
export const load_tools = (
) => {
    // -- Get the tools elm_
    const tools = get_tools();
    log('INFO', `Loaded in ${tools.length} tool('s)`);

    // -- Add the event listeners
    add_listeners(tools);

    // -- Set the first tool as active
    set_state(tools, tools[0]);

    // -- Add the shortcut actions
    add_shorcut_actions();
};



/**
 * @name add_shorcut_actions
 * Adds the actions to the shortcuts
 * 
 * @returns {void} - Nothing
 */
export const add_shorcut_actions = (
) => {
    // -- Get the shortcuts instance
    const si = Shortcuts.get_instance();

    const tools = get_tools();

    // -- Add the actions
    const select_tool = tools.find((tool) => tool.tool === 'select');
    si.assign_action('tools-select', () => set_state(tools, select_tool));

    const move_tool = tools.find((tool) => tool.tool === 'move');
    si.assign_action('tools-move', () => set_state(tools, move_tool));

    const anchor_add_tool = tools.find((tool) => tool.tool === 'anchor-add');
    si.assign_action('tools-anchor-add', () => set_state(tools, anchor_add_tool));

    const anchor_remove_tool = tools.find((tool) => tool.tool === 'anchor-remove');
    si.assign_action('tools-anchor-remove', () => set_state(tools, anchor_remove_tool));


    log('INFO', 'Added tool shortcut actions');
}