import { create_popup } from '../../popups';
import { create_input_group, popup_input } from '../../popups/inputs';
import { SearchBar, add_items_to_list, create_pagination_bar, create_search_bar, create_search_menu } from '../item_list';
import LocalStorage from '../../local_storage';
import { log } from '../../log';

let open = false;

/**
 * @name list_projects
 * Lists all the projects that are saved locally
 * 
 * @returns {void}
 */
export const list_projects = () => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;


    // -- Create the content
    const search_box = create_search_menu('project', 'list');
    
    // -- Create the popup
    const prompt = create_popup({
        title: 'Projects',
        message: '',
        buttons: [],
        auto_close: false,
        close_button: true,
        on_close: () => open = false,
    }, search_box);
    

    // -- Add a 'search' class to the popup
    prompt.main_elm.setAttribute('search', 'projects');
};