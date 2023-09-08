import { log } from '../../log';
import { create } from '../../popups/popups';

import { create_search_menu } from '../item_list';

let open = false;

/**
 * @name list_patterns
 * Lists all the patterns that are saved locally
 * 
 * @returns {void}
 */
export const list_patterns = (
    title: string,
    mode: 'load' | 'use' | 'list'
) => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;


    // -- Create the content
    let close: () => void;
    const search_box = create_search_menu('x_pattern', mode, () => {
        log('INFO', 'x_pattern search menu closed');
        if (close) close();
        else log('ERROR', 'Failed to close x_pattern search menu');
    });
    
    // -- Create the popup
    const prompt = create({
        title: title,
        message: '',
        buttons: [],
        auto_close: false,
        close_button: true,
        on_close: () => open = false,
    }, search_box);
    
    close = prompt.close;

    // -- Add a 'search' class to the popup
    prompt.main_elm.setAttribute('search', 'projects');
};