import { Popup, PopupButton } from './index.d';
import { log } from '../log';



// -- Get the popup container
const popup_container = document.getElementById('popup-container');
if (!popup_container) {
    log('ERROR', 'Missing popup container');
    throw new Error('Missing popup container');
}
// <popup x-button='true' anim='in'>
// <div>
//     <div popup-section='header'>
//         <h1 popup-section='title'>Title</h1>
//         <i popup-section='close' class='fas fa-times'></i>
//     </div>
    
//     <p popup-section='content'></p>

//     <div popup-section='buttons'>
//         <button popup-button='ERROR'></button>
//         <button popup-button='WARNING'></button>
//         <button popup-button='INFO'></button>
//         <button popup-button='SUCCESS'></button>
//     </div>
// </div>
// </popup>


const create_button = (
    cfg: PopupButton
): HTMLElement => {
    const button = document.createElement('button');
    button.setAttribute('popup-button', cfg.type);
    button.setAttribute('btn-text', cfg.text);
    button.innerText = cfg.text;

    button.addEventListener('click', () => {
        cfg.callback();
    });

    return button;
};

const create_popup_element = (
    popup: Popup,
    element: HTMLElement = null
): HTMLElement => {
    const popup_element = document.createElement('popup');
    popup_element.setAttribute('x-button', `${popup.close_button}`);
    popup_element.setAttribute('anim', 'in');

    const popup_content = document.createElement('div');

    const popup_header = document.createElement('div');
    popup_header.setAttribute('popup-section', 'header');

    const popup_title = document.createElement('h1');
    popup_title.setAttribute('popup-section', 'title');
    popup_title.innerText = popup.title;

    const popup_close = document.createElement('i');
    popup_close.setAttribute('popup-section', 'close');
    popup_close.classList.add('fas', 'fa-times');

    popup_header.appendChild(popup_title);
    popup_header.appendChild(popup_close);

    const popup_body = document.createElement('div');
    popup_body.setAttribute('popup-section', 'content');
    popup_body.innerText = popup.message;

    if (element) {
        popup_body.appendChild(element);
        element.setAttribute('popup-section', 'cust-content');
    }

    popup_content.appendChild(popup_header);
    popup_content.appendChild(popup_body);

    if (popup.buttons.length > 0) {
        const popup_buttons = document.createElement('div');
        popup_buttons.setAttribute('popup-section', 'buttons');

        popup.buttons.forEach((button) => {
            popup_buttons.appendChild(create_button(button));
        });
        popup_content.appendChild(popup_buttons);
    }

    popup_element.appendChild(popup_content);

    return popup_element;
};

/**
 * @name create_popup
 * Creates a popup box given a Popup object
 * 
 * @param {Popup} popup - The popup object
 * @param {HTMLElement} [element=null] - Custom elements that can be added to the popup
 * 
 * @returns {() => void} A function to close the popup
 */
export const create_popup = (
    popup: Popup,
    element: HTMLElement = null
): () => void => {
    log('INFO', 'Creating popup');
    const popup_element = create_popup_element(popup, element);
    popup_container.appendChild(popup_element);

    let closed = false;
    new Promise((resolve) => {
        
        const btns = popup_element.querySelectorAll('button');
        btns.forEach((btn) => btn.addEventListener('click', () => {
            if (!popup.auto_close) return;
            closed = true;
        }));

        const x_btn = popup_element.querySelector('[popup-section="close"]');
        if (x_btn) x_btn.addEventListener('click', () => {
            if (!popup.close_button) return;
            closed = true;
        });

        
        // -- Check if the popup has been closed
        const check_closed = () => {

            // -- Wait for the popup to be closed
            if (!closed) return setTimeout(check_closed, 100);

            // -- Else close the popup
            popup_element.setAttribute('anim', 'out');
            popup_element.addEventListener('animationend', () => 
            popup_container.removeChild(popup_element));
            log('INFO', 'Popup closed');

            // -- Remove the element after 3 sec if it doesn't close
            setTimeout(() => {
                if (!popup_element.parentNode) return;
                popup_element.parentNode.removeChild(popup_element);
                log('WARN', 'Emergency popup close');
            }, 3000);
        }


        // -- Start the check
        check_closed();
    });

    // -- Return a function to close the popup
    return () => { closed = true; };
};