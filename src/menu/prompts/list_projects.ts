import { log } from '../../log';
import { create } from '../../popups/popups';

import { create_search_menu } from '../item_list';

let open = false;

/**
 * @name list_projects
 * Lists all the projects that are saved locally
 * 
 * @returns {void}
 */
export const list_projects = (
    title: string,
    mode: 'load' | 'use' | 'list'
) => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;


    // -- Create the content
    let close: () => void;
    const search_box = create_search_menu('project', mode, () => {
        log('INFO', 'Project search menu closed');
        if (close) close();
        else log('ERROR', 'Failed to close project search menu');
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