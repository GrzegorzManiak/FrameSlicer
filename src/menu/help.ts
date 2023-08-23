import { create_popup } from '../popup';
import { create_input_group, popup_input } from '../popup/inputs';

let open = false;

/**
 * @name about_menu_prompt
 * About menu prompt
 * 
 * @returns {void}
 */
export const about_menu_prompt = () => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;
    
    // -- Create the popup
    const close_prompt = create_popup({
        title: 'About',
        message: `
            FS Editor is a free and open source project that is being developed by Grzegorz M.
            If you have any questions or suggestions, please contact me via email (fs@Grzegorz.ie) or github (@GrzegorzManiak).
            Thank you for using FS Editor!
        `,
        buttons: [
            { text: 'Github', type: 'INFO', callback: () => {
                window.open('https://github.com/GrzegorzManiak/FrameSlicer', '_blank');
            }},

            { text: 'Grzegorz', type: 'INFO', callback: () => {
                window.open('https://grzegorz.ie', '_blank');
            }},
        ],
        auto_close: true,
        close_button: true,
        on_close: () => open = false,
    });
};