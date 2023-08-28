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



    // -- Special case for dropdowns as they are completely different
    if (type === 'dropdown' && placeholder instanceof Array) 
        input_element.appendChild(_dropdown_input(placeholder, on_change));
    
    // -- All other inputs are the same
    else input_element.appendChild(_defualt_input(
        placeholder, type, on_change, on_enter, on_escape));
    


    // -- Add the elements to the input header
    input_header.appendChild(input_title);
    input_header.appendChild(input_dash);
    input_header.appendChild(input_desc);

    // -- Return the input element
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



/**
 * @name _dropdown_input
 * Internal function that creates a dropdown input
 * and appends all options / event listeners
 * 
 * @param {Array<string>} options - The options for the dropdown
 * @param {(value: unknown) => void} on_change - The function to call when the input changes
 * 
 * @returns {HTMLDivElement} The dropdown input element
 */
const _dropdown_input = <e>(
    options: Array<string>,
    on_change: (value: e) => void,
): HTMLDivElement => {
    // -- Create the main dropdown element
    const dropdown = create_dropdown('No options provided');
    dropdown.group_elm.classList.add('popup-input-dropdown');

    
    // -- Loop through all the options and create them
    const process_options = options.map((option) => {

        // -- Create the option element and add it to the dropdown
        const option_elements = _dropdown_option(option);
        dropdown.options_elm.appendChild(option_elements.opt_elm);
        option_elements.opt_elm.addEventListener('click', () => set_value(option));

        // -- Return the option
        return {
            elements: option_elements,
            value: option,
        };
    });


    // -- Helper function to set the dropdown value
    const set_value = (value: string) => {

        // -- Set the title
        dropdown.title_elm.innerText = value;

        // -- Loop through all the options
        process_options.forEach((option) => {
            
            // -- If the option is the value, set it to active
            if (option.value === value) {
                option.elements.opt_elm.classList.add('active');
                option.elements.shortcut_elm.innerText = '✓ Selected';
                return;
            }

            // -- Else remove the active class
            option.elements.opt_elm.classList.remove('active');
            option.elements.shortcut_elm.innerText = '';
        });

        // -- Call the on change function
        on_change(value as unknown as e);
    };


    // -- Return the dropdown element and the set value function
    if (options.length > 0) set_value(options[0]);
    return dropdown.group_elm;
};



/**
 * @name _dropdown_option
 * Internal function that creates a dropdown option
 * 
 * @param {string} option - The option to create
 * 
 * @returns {HTMLDivElement} The dropdown option element
 */
const _dropdown_option = (
    option: string,
): {
    opt_elm: HTMLElement,
    title_elm: HTMLParagraphElement,
    shortcut_elm: HTMLParagraphElement,
} => {
    // -- Main element
    const opt_elm = document.createElement('s-opt');
    opt_elm.setAttribute('option', option.toLowerCase());

    // -- Title element
    const title_elm = document.createElement('p');
    title_elm.classList.add('title');
    title_elm.innerText = option;
    opt_elm.appendChild(title_elm);

    // -- Aux text (Used for shortcuts normally)
    const shortcut_elm = document.createElement('p');
    shortcut_elm.classList.add('shortcut');
    opt_elm.appendChild(shortcut_elm);

    // -- Return the option element
    return {
        opt_elm,
        title_elm,
        shortcut_elm,
    };
};



/**
 * @name _defualt_input
 * Internal function that creates a defualt general
 * input as most inputs are the same and are changed
 * by CSS
 * 
 * @param {string | Array<string>} placeholder - The placeholder for the input
 * @param {'text' | 'number' | 'checkbox' | 'dropdown'} type - The type of input
 * @parma {(value: e) => void} on_change - The function to call when the input changes
 * @param {(value: e) => void} on_enter - The function to call when the enter key is pressed
 * @param {(value: e) => void} on_escape - The function to call when the escape key is pressed
 */
const _defualt_input = <e>(
    placeholder: string | Array<string> = '',
    type: 'text' | 'number' | 'checkbox' | 'dropdown' = 'text',
    on_change: (value: unknown) => void = () => {},
    on_enter: (value: unknown) => void = () => {},
    on_escape: (value: unknown) => void = () => {},
): HTMLInputElement => {
    // -- Create the input element
    const input = document.createElement('input');
    let prev_value = '';

    input.setAttribute('type', type);
    input.setAttribute('placeholder', placeholder as string);
    input.addEventListener('change', () => {
        // -- If the input type is a number, check if its a number
        if (type === 'number') {
            const value = input.value as unknown as number;
            if (isNaN(value)) input.value = prev_value;
        }

        // -- Call the on change function
        on_change(input.value as unknown as e);
        prev_value = input.value;
    });
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') on_enter(input.value as unknown as e);
        if (e.key === 'Escape') on_escape(input.value as unknown as e);
    });

    // -- CHeck if its a checkbox and if the placeholder is true
    if (type === 'checkbox' && placeholder === 'true') 
        input.setAttribute('checked', '');

    // -- Return the input element
    return input;
};