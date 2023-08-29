import { create_popup } from '../../popups';
import { create_input_group, popup_input } from '../../popups/inputs';
import LocalStorage from '../../local_storage';
import { create_toast } from '../../popups/toasts';
import { _x_line, _y_line } from '../..';
import { log } from '../../log';

let open = false;
// TODO: Add a system that keeps track of the current project
//       so that this menu only has to be shown when the project
//       is first created

/**
 * @name save_project_menu_prompt
 * Creates a popup box that asks the user if they 
 * want to save their current project
 * 
 * @returns {void}
 */
export const save_project_menu_prompt = () => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;
    let name = '';

    const inputs = create_input_group();   
    inputs.appendChild(popup_input<string>(
        'Project Name', 
        'Must be a unique name',
        'Sick Project', 
        'text', 
        (value) => name = value)
    );

    // -- Create the popup
    const prompt = create_popup({
        title: 'Save Project',
        message: 'Would you like to save your current project?',
        buttons: [{ 
            id: 'save',
            text: 'Save Project',
            type: 'SUCCESS', 
            callback: (lock) => {
                // -- Lock the button
                lock(true);

                // -- Ensure the name is valid
                if (name.length < 3) {
                    lock(false);
                    return create_toast(
                        'warning', 
                        'Save Project', 
                        'Project name must be at least 3 characters long'
                    );
                }
                
                // -- Attempt to save the project
                const lsi = LocalStorage.get_instance(),
                    unique = lsi.ensure_unique_project_name(name);

                // -- Check if the name is unique
                if (!unique) {
                    lock(false);
                    return create_toast(
                        'warning',
                        'Save Project',
                        'Project name must be unique'
                    );
                }

                // -- Save the project
                const saved = lsi.save_project(name, _x_line, _y_line);
                if (!saved) {
                    lock(false);
                    return create_toast(
                        'error',
                        'Save Project',
                        'Failed to save project'
                    );
                }

                // -- Close the popup
                create_toast(
                    'success',
                    'Save Project',
                    'Project saved successfully'
                );
                prompt.close();
            }
        }],
        auto_close: false,
        close_button: true,
        on_close: () => {
            open = false;
            name = '';
        },
    }, inputs);
};