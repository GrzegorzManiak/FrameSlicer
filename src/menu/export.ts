import { create_popup } from '../popup';
import { create_input_group, popup_input } from '../popup/inputs';

let open = false;

/**
 * @name export_menu_prompt
 * Creates a popup box that asks the user if they 
 * want to export their current project
 * 
 * @returns {void}
 */
export const export_menu_prompt = () => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;
    
    // -- Create the popup
    const close_prompt = create_popup({
        title: 'Export',
        message: 'Would you like to export your current project as a .fse file? You can import it later.',
        buttons: [
            { text: 'Export', type: 'SUCCESS', callback: () => close_prompt() },
        ],
        auto_close: true,
        close_button: true,
        on_close: () => open = false,
    }, create_input_group().appendChild(
        popup_input('Project Name', 'Saved in .fse format', 'name.fse', 'text')
    ));
};