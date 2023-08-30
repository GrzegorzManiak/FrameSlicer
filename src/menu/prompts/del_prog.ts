import { create_popup } from '../../popups';
import { create_input_group, popup_input } from '../../popups/inputs';

let open = false;

/**
 * @name del_prog_prompt
 * THIS Prompts the user if they want to continue
 * and delete their current work
 * 
 * @returns {void}
 */
export const del_prog_prompt = (
    yes_callback: () => void,
    no_callback: () => void
) => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;
    
    // -- Create the popup
    create_popup({
        title: 'Continue?',
        message: `
            Are you sure you want continue? This will delete any unsaved work.
        `,
        buttons: [
            { id: 'dp-yes', text: 'Continue', type: 'ERROR', callback: () => {
                yes_callback();
            }},

            { id: 'dp-no', text: 'Cancle', type: 'INFO', callback: () => {
                no_callback();
            }},
        ],
        auto_close: true,
        close_button: false,
        on_close: () => open = false,
    });
};