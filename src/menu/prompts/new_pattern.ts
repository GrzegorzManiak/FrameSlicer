import { log } from '../../log';
import { create_popup } from '../../popups';
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
export const new_pattern_menu_prompt = () => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;    

    const auto_save = create_input_group();
    auto_save.appendChild(popup_input(
        'Save project',
        'Automatically save your project locally',
        'true',
        'checkbox'
    ));

    const check_box = create_input_group();
    check_box.appendChild(popup_input('Pattern type', `The type of pattern to create`, [
        '(Y axis) - Side to side',
        '(X axis) - Front to back',
    ], 'dropdown'));

    const size_group = create_input_group();
    size_group.appendChild(popup_input('Width', '', '100', 'number'));
    size_group.appendChild(popup_input('Height', '', '100', 'number'));
    size_group.appendChild(popup_input('Depth', '', '100', 'number'));

    const div = document.createElement('div');
    div.appendChild(auto_save);
    div.appendChild(check_box);
    div.appendChild(size_group);

    
    // -- Create the popup
    const prompt = create_popup({
        title: 'New Pattern',
        message: `Create a new pattern, this will overwrite your current project, any unsaved changes will be lost.`,
        buttons: [{ 
            text: 'Create', 
            type: 'SUCCESS', 
            callback: (lock) => {
                // -- Lock the button
                lock(true);

            } 
        }],
        auto_close: false,
        close_button: true,
        on_close: () => open = false,
        on_open: () => {
            log('INFO', 'New pattern menu opened');
        }
    }, div);
};