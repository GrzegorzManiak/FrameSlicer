import { Popup, PopupButton, PopupReturns } from './index.d';
import { log } from '../log';



// -- Get the popup container
const popup_container = document.getElementById('popup-container');
if (!popup_container) {
    log('ERROR', 'Missing popup container');
    throw new Error('Missing popup container');
}



const create_button = (
    cfg: PopupButton
): HTMLElement => {
    const button = document.createElement('button');
    button.setAttribute('popup-button', cfg.type);
    button.setAttribute('btn-text', cfg.text);
    button.innerText = cfg.text;

    const lock_state = (state: boolean) => {
        if (state) button.setAttribute('disabled', '');
        else button.removeAttribute('disabled');
    };

    button.addEventListener('click', () => {
        if (!cfg.callback) return;
        if (button.hasAttribute('disabled')) return;
        cfg.callback((state: boolean) => lock_state(state))
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
    const lines = popup.message.split('\n');
    lines.forEach((line) => {
        const p = document.createElement('p');
        p.innerText = line;
        popup_body.appendChild(p);
    });

    popup_content.appendChild(popup_header);
    popup_content.appendChild(popup_body);

    if (element) {
        const custom_content = document.createElement('div');
        custom_content.appendChild(element);
        custom_content.setAttribute('popup-section', 'cust-content');
        popup_content.appendChild(custom_content);
    }

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
 * @param {number} [timeout=4000] - The time in ms to wait before closing the popup
 * 
 * @returns {PopupReturns} A function to close the popup
 */
export const create_popup = (
    popup: Popup,
    element: HTMLElement = null,
    timeout: number = 4000
): PopupReturns => {
    log('INFO', 'Creating popup');
    const popup_element = create_popup_element(popup, element);
    popup_container.appendChild(popup_element);
    let closed = false;


    // -- Add button listeners
    const btns = popup_element.querySelectorAll('button');
    btns.forEach((btn) => btn.addEventListener('click', () => {
        if (!popup.auto_close) return;
        closed = true;
    }));

    
    // -- Top right close button
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
        popup.on_close?.();

        // -- Remove the element after x sec if it doesn't close
        setTimeout(() => {
            if (!popup_element.parentNode) return;
            popup_element.parentNode.removeChild(popup_element);
            log('WARN', 'Emergency popup close');
            popup.on_close?.();
        }, timeout);
    };


    // -- Start the check loop and return the close function
    check_closed();
    return {
        close: () => closed = true,
        lock_button: (state: boolean, name: string) => {
            const btn = Array.from(popup_element.querySelectorAll(`[btn-text="${name}"]`));
            btn.forEach((b) => state ? b.setAttribute('disabled', '') : b.removeAttribute('disabled'));
        }
    }
};