/**
 * These set of functions handle the switiching of
 * tools from the 'Tools' tab.
 */
import { log } from '../log';
import { Tool, ToolObject } from './index.d';

let _tools: Array<ToolObject> = [];
let _active_tool = -1;
let _callbacks: Array<(tool: ToolObject) => void> = [];



/**
 * @name get_tools
 * Get the available tools from the tool box in the document, this should only
 * be called once as it stores the tools in a non exported global variable.
 * 
 * @throws {Error} If the tool box is not found or if an invalid tool is encountered.
 * 
 * @returns {Array<ToolObject>} - An array of ToolObject representing the available tools.
 */
export const get_tools = (
) => {
    // -- Get the tool box
    const tool_box = document.querySelector('[sub-box-name=\'tools\']');
    if (!tool_box) throw Error('Tool box not located');

    // -- Get the tools
    const tools = Array.from(tool_box.querySelectorAll('div[tool]')),
        valid: Array<Tool> = [
            'select',
            'move',
            'anchor-add',
            'anchor-remove',
        ];

    const proccessed: Array<ToolObject> = [];
    tools.forEach((tool_elm) => {
        // -- Get the 'tool' attribute
        const tool_type = tool_elm.getAttribute('tool'),
            exists = valid.indexOf(tool_type as Tool);

        // -- Return if it dosent exist, remove it if it dose
        if (exists === -1) throw Error('Invalid tool');

        // -- Remove it
        valid.splice(exists, 1);

        // -- Add the element to the proccessed array
        proccessed.push({
            active: false,
            elem: tool_elm as HTMLDivElement,
            tool: tool_type as Tool,
        });
    });

    // -- Return the tools
    _tools = proccessed;
    return proccessed;
};



/**
 * @name add_listeners
 * Adds all the event listeners to an array of tools.
 * This should also only be called once.
 * 
 * @param {Array<ToolObject>} tools - The tools to add the listeners to
 * 
 * @returns {void} - Nothing
 */
export const add_listeners = (
    tools: Array<ToolObject>
) => {
    _active_tool = -1;

    // -- Loop trough thr tools
    tools.forEach((tool) => {
        // -- click
        tool.elem.addEventListener('click', () => {
            // -- Get the index of this tool
            const index = tools.indexOf(tool);

            // -- CHeck if its already active
            if (_active_tool === index) return;

            // -- Set this tool as active
            set_state(tools, tool);
            _active_tool = index;

            // -- Log
            log('INFO', `Tool '${tool.tool}' selected`);
        });
    });
};



/**
 * @name set_state
 * Sets the state of the tools, this is used to set the
 * active tool.
 * 
 * @param {Array<ToolObject>} tools - The tools to set the state of
 * @param {ToolObject} tool - The tool to set as active
 * 
 * @returns {void} - Nothing
 */
export const set_state = (
    tools: Array<ToolObject>, 
    tool: ToolObject
) => {
    // -- Loop trough all tools and set them off
    tools.forEach((tool) => {
        tool.active = false;
        tool.elem.removeAttribute('tool-selected');
    });

    // -- Set the new tool as active
    tool.elem.setAttribute('tool-selected', '');
    tool.active = true;
    _active_tool = _tools.indexOf(tool);

    // -- Execute the listeners
    exceute_listeners(tool);
};



/**
 * @name append_listener
 * Appends a listener that get called once
 * the active tool is changed.
 * 
 * @param {(tool: ToolObject) => void} callback - The callback to call
 * 
 * @returns {void} - Nothing
 */
export const append_listener = (
    callback: (tool: ToolObject) => void
) => {
    _callbacks.push(callback);
};



/**
 * @name exceute_listeners
 * Executes all the listeners that are appended
 * to the tool loader.
 * 
 * @param {ToolObject} tool - The currently selected tool
 * 
 * @returns {void} - Nothing
 */
export const exceute_listeners = (
    tool: ToolObject = get_active_tool()
) => {
    _callbacks.forEach((callback) => callback(tool));
};


/**
 * @name get_active_tool
 * Returns the currently selected tool, if no
 * tools are loaded it will return the defualt tool.
 * 
 * @returns {ToolObject} - The currently selected tool
 */
export const get_active_tool = (
): ToolObject => {
    // -- get the acive tool
    if (_tools.length > 0 && _active_tool > 0) return _tools[_active_tool];

    // -- No selected tool?, return the first one
    else if (_tools.length > 0) return _tools[0];

    // -- Last resort
    else return {
        active: true,
        tool: 'select',
        elem: document.createElement('div'),
    };
};
