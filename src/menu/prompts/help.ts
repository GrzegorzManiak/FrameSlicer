import { create } from '../../popups/popups';

import { create_input_group, popup_input } from '../../popups/inputs';

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
    create({
        title: 'About',
        message: `
            FS Editor is a free and open source project that is being developed by Grzegorz M.
            If you have any questions or suggestions, please contact me via email (fs@Grzegorz.ie) or github (@GrzegorzManiak).
            Thank you for using FS Editor!
        `,
        buttons: [
            { id: 'gh-btn', text: 'Github', type: 'INFO', callback: () => {
                window.open('https://github.com/GrzegorzManiak/FrameSlicer', '_blank');
            }},

            { id: 'ps-btn', text: 'Grzegorz', type: 'INFO', callback: () => {
                window.open('https://grzegorz.ie', '_blank');
            }},
        ],
        auto_close: true,
        close_button: true,
        on_close: () => open = false,
    });
};