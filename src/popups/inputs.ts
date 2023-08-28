import { create_dropdown } from "../menu";

/**
 * @name popup_input
 * This returns a input element that is styled to
 * match the popup box
 * 
 * <div popup-input has-desc='true' type='number'>
 *  <div class='popup-input-header'>
 *    <p class='popup-input-title'>Project Name</p>
 *    <p class='popup-input-dash'>-</p>
 *    <p class='popup-input-desc'>Short Description</p>
 *  </div>
 *  <input type="number" placeholder="Project Name">
 * </div>
 * 
 * @param {string} label - The label for the input
 * @param {string} description - The description for the input
 * @param {string | Array<string>} placeholder - The placeholder for the input
 * @param {'text' | 'number' | 'checkbox' | 'dropdown'} type - The type of input
 * 
 * @param {(value: unknown) => void} on_change - The function to call when the input changes
 * @param {(value: unknown) => void} on_enter - The function to call when the enter key is pressed
 * @param {(value: unknown) => void} on_escape - The function to call when the escape key is pressed
 * 
 * @returns {HTMLDivElement} The input element
 */
export const popup_input = <e>(
    label: string,
    description: string,
    placeholder: string | Array<string> = '',
    type: 'text' | 'number' | 'checkbox' | 'dropdown' = 'text',
    on_change: (value: e) => void = () => {},
    on_enter: (value: e) => void = () => {},
    on_escape: (value: e) => void = () => {},
): HTMLDivElement => {
    // -- Create the input element
    const input_element = document.createElement('div');
    input_element.setAttribute('popup-input', '');
    input_element.setAttribute('has-desc', description ? 'true' : 'false');
    input_element.setAttribute('type', type);

    // -- Create the input header
    const input_header = document.createElement('div');
    input_header.classList.add('popup-input-header');
    
    // -- Create the input title
    const input_title = document.createElement('p');
    input_title.classList.add('popup-input-title');
    input_title.innerText = label;

    // -- Create the input dash
    const input_dash = document.createElement('p');
    input_dash.classList.add('popup-input-dash');
    input_dash.innerText = '-';

    // -- Create the input description
    const input_desc = document.createElement('p');
    input_desc.classList.add('popup-input-desc');
    input_desc.innerText = description;
    input_element.appendChild(input_header);


    if (type === 'dropdown' && placeholder instanceof Array) {
        // -- Create the dropdown element
        const dropdown = create_dropdown('No options provided');
        dropdown.group_elm.classList.add('popup-input-dropdown');

        // -- Create the dropdown options
        placeholder.forEach((option, i) => {
            const opt_elm = document.createElement('s-opt');
            opt_elm.setAttribute('option', option.toLowerCase());
            opt_elm.setAttribute('selected', i === 0 ? 'true' : 'false');

            const title_elm = document.createElement('p');
            title_elm.classList.add('title');
            title_elm.innerText = option;
            opt_elm.appendChild(title_elm);

            const shortcut_elm = document.createElement('p');
            shortcut_elm.classList.add('shortcut');
            shortcut_elm.innerText = i === 0 ? 'Selected' : '';
            opt_elm.appendChild(shortcut_elm);

            dropdown.options_elm.appendChild(opt_elm);
            opt_elm.addEventListener('click', () => {
                
                // -- Find the selected option
                dropdown.options_elm.querySelectorAll('s-opt').forEach((opt) => {
                    // -- Set the selected attribute to false
                    opt.setAttribute('selected', 'false');

                    // -- Find the 'selected' shortcut element
                    const shortcut = opt.querySelector('.shortcut') as HTMLElement;
                    if (shortcut.innerText === 'Selected') shortcut.innerText = '';
                });

                // -- Set the selected attribute to true
                opt_elm.setAttribute('selected', 'true');

                // -- Set the title
                dropdown.title_elm.innerText = option;
                shortcut_elm.innerText = 'Selected';
                
                // -- Call the on change function
                on_change(option as unknown as e);
            });
        });

        // -- Set the first option to be selected
        if (dropdown.options_elm.children.length > 0) {
            const first_option = dropdown.options_elm.children[0] as HTMLElement;
            first_option.setAttribute('selected', 'true');
            dropdown.title_elm.innerText = first_option.getAttribute('option') as string;
            on_change(first_option.getAttribute('option') as unknown as e);
        }


        // -- Add the dropdown to the input element
        input_element.appendChild(dropdown.group_elm);
    }

    else {
        // -- Create the input element
        const input = document.createElement('input');

        input.setAttribute('type', type);
        input.setAttribute('placeholder', placeholder as string);
        input.addEventListener('change', () => on_change(input.value as unknown as e));
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') on_enter(input.value as unknown as e);
            if (e.key === 'Escape') on_escape(input.value as unknown as e);
        });

        // -- CHeck if its a checkbox and if the placeholder is true
        if (type === 'checkbox' && placeholder === 'true') 
            input.setAttribute('checked', '');

        // -- Add the elements to the input element
        input_element.appendChild(input);
    }

    // -- Add the elements to the input header
    input_header.appendChild(input_title);
    input_header.appendChild(input_dash);
    input_header.appendChild(input_desc);

    return input_element;
}



/**
 * @name create_input_group
 * Creates a group of inputs so that you can have inputs side by side
 * if they dont fit, they will just stack
 * 
 * @returns {HTMLDivElement} The input group element
 */
export const create_input_group = (): HTMLDivElement => {
    const input_group = document.createElement('div');
    input_group.classList.add('popup-input-group');
    return input_group;
}