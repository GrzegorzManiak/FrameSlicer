import { create } from '../../popups/popups';

import { create_input_group, popup_input } from '../../popups/inputs';

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

    const inputs = create_input_group();   
    inputs.appendChild(popup_input(
        'Save current',
        'Automatically save your current project locally',
        'true',
        'checkbox'
    ));
    inputs.appendChild(popup_input(
        'Project Name', 
        'Saved in .fse format', 
        'name.fse', 
        'text'
    ));

    // -- Create the popup
    const prompt = create({
        title: 'Export',
        message: 'Would you like to export your current project as a .fse file? You can import it later.',
        buttons: [{ 
            id: 'export',
            text: 'Export',
            type: 'SUCCESS', 
            callback: () => prompt.close() 
        }],
        auto_close: true,
        close_button: true,
        on_close: () => open = false,
    }, inputs);
};