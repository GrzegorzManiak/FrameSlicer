import { log } from '../../log';
import { create } from '../../popups/popups';

import { create_input_group, popup_input } from '../../popups/inputs';
import { create_toast } from '../../popups/toasts';

let open = false;

/**
 * @name new_pattern_menu_prompt
 * Creates a popup box that asks the user if they
 * want to create a new pattern
 * 
 * @returns {void}
 */
export const new_pattern_menu_prompt = (): void => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;    



    // -- Create the popup
    const popup = create({
        title: 'New Pattern',
        message: `Create a new pattern, this will overwrite your current project, any unsaved changes will be lost.`,
        buttons: [{ 
            id: 'create',
            text: 'Create', 
            type: 'SUCCESS', 
            callback: (lock) => {
                // -- Lock the button
                lock(true);
                log('INFO', 'New pattern menu create button pressed');

                // -- Close the popup
                popup.close();
            } 
        }],
        auto_close: false,
        close_button: true,
        on_close: () => open = false,
        on_open: (pr) => {
         
        }
    });
};