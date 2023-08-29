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
export const new_pattern_menu_prompt = (): void => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;    


    // -- Variables used to store the inputs
    const drop_down_opts = ['(Y axis) - Side to side', '(X axis) - Front to back'];
    const min_size = 15;
    let width = -1, height = -1, depth = -1, anchors = 0,
        name = '', pattern_type = drop_down_opts[0];
        


    // -- Helper function to check if the inputs are valid
    const check_inputs = (): boolean => {
    
        const valid = (() => {
            // -- Check if the name is valid
            if (name.length === 0) return false;

            // -- Check if the width is valid
            if (pattern_type === drop_down_opts[0]) 
                if (width < min_size || height < min_size) return false;
            
            // -- Check if the depth is valid
            if (pattern_type === drop_down_opts[1]) 
                if (width < min_size || depth < min_size) return false;

            // -- Check if the anchors are valid
            if (anchors < 0) return false;

            // -- All checks passed
            log('INFO', 'New pattern menu inputs are valid');
            return true;
        })();

        // -- Return true if all checks passed
        if (popup) popup.lock_button(!valid, 'create');
        return valid;
    }


    // -- Name input
    const name_elm = popup_input<string>('Pattern Name', 'The name of your new pattern',
        'Wavy 2x2', 'text', (value) => { name = value; check_inputs(); });

    // -- Auto anchor input
    const auto_anchor = popup_input<number>('Auto Anchor', 'Adds x equaly spaced anchors to the pattern',
        '0', 'number', (value) => { anchors = value; check_inputs(); });


    // -- Size inputs
    const size_group = create_input_group();
    size_group.appendChild(popup_input<number>('Width', 'mm', '100', 'number', 
        (v) => { width = v; check_inputs(); }));
    size_group.appendChild(popup_input<number>('Height', 'mm', '100', 'number', 
        (v) => { height = v; check_inputs(); }));
    size_group.appendChild(popup_input<number>('Depth', 'mm', '100', 'number',  
        (v) => { depth = v; check_inputs(); }));


    // -- pattern type
    const check_box = create_input_group();
    check_box.appendChild(popup_input('Pattern type', `The type of pattern to create`, drop_down_opts, 'dropdown', (value) => {
        // -- Get the pattern type, this will set the inputs that are shown
        pattern_type = value as string;

        // -- Show the width and height inputs
        if (pattern_type === '(Y axis) - Side to side') {
            size_group.children[0].classList.remove('popup-input-hidden');
            size_group.children[1].classList.remove('popup-input-hidden');
            size_group.children[2].classList.add('popup-input-hidden');
        }

        // -- Show the width and depth inputs
        if (pattern_type === '(X axis) - Front to back') {
            size_group.children[0].classList.remove('popup-input-hidden');
            size_group.children[1].classList.add('popup-input-hidden');
            size_group.children[2].classList.remove('popup-input-hidden');
        }

        // -- Check the inputs
        check_inputs();
    }));

    // -- Add all the inputs to the input group
    const inputs = create_input_group();
    inputs.appendChild(name_elm);
    inputs.appendChild(auto_anchor);
    inputs.appendChild(check_box);
    inputs.appendChild(size_group);

    // -- Create the popup
    const popup = create_popup({
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
            log('INFO', 'New pattern menu opened');
            pr.lock_button(true, 'create');
        }
    }, inputs);
};