import { create } from '../../popups/popups';

import { create_input_group, popup_input } from '../../popups/inputs';
import LocalStorage from '../../local_storage';
import { create_toast } from '../../popups/toasts';
import App from '../..';
import { log } from '../../log';

let open = false;

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



    // -- Create the popup inputs
    const inputs = create_input_group();   
    inputs.appendChild(popup_input<string>(
        'Project Name', 
        'Must be a unique name',
        'Sick Project', 
        'text', 
        (value) => name = value)
    );



    // -- Get the app instance and the lines
    const app = App.get_instance();
    const _x_line = app.get_x_line(),
        _y_line = app.get_y_line();



    // -- Check if the lines are valid
    if (!_x_line || !_y_line) {
        log('ERROR', 'Failed to get the x or y line');
        return create_toast(
            'error',
            'Save Project',
            'Failed to save project'
        );
    }



    // -- Try to save the project
    if (app.stage_identifier) {

        // -- Attempt to save the project
        log('INFO', `Saving project as ${app.stage_identifier}`);
        const lsi = LocalStorage.get_instance(),
            saved = lsi.update_project(app.stage_identifier, _x_line, _y_line);


        // -- Check if the project was saved
        if (saved) {
            create_toast('success', 'Save Project', 'Project saved successfully');
            open = false;
            return;
        }

        
        // -- Else, alert the user, and try to save the project as a new one
        else {
            log('ERROR', 'Failed to save the project');
            app.stage_identifier = '';
            create_toast('error', 'Save Project', 'Failed to save project');
        }
    }


    
    // -- Create the popup if there is no id
    const prompt = create({
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
                    create_toast('warning', 'Save Project', 'Project name must be at least 3 characters long');
                    return lock(false);
                }
                

                // -- Attempt to save the project
                const lsi = LocalStorage.get_instance(),
                    unique = lsi.ensure_unique_project_name(name);


                // -- Check if the name is unique
                if (!unique) {
                    create_toast('warning', 'Save Project', 'Project name must be unique');
                    return lock(false);
                }


                // -- Save the project
                const saved = lsi.save_project(name, _x_line, _y_line);
                if (!saved) {
                    create_toast('error', 'Save Project', 'Failed to save project');
                    return lock(false);
                }


                // -- Alert the user
                create_toast('success', 'Save Project', 'Project saved successfully');
                log('INFO', `Project saved as ${name}`);


                // -- Set the app instance id and close the popup
                app.stage_identifier = name;
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