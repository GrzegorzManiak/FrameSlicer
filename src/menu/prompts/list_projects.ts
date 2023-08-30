import { create_popup } from '../../popups';
import { create_input_group, popup_input } from '../../popups/inputs';
import { SearchBar, add_items_to_list, create_pagination_bar, create_search_bar } from '../item_list';
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
    let results = [], content = create_input_group();
    content.classList.add('list-projects');

    // -- Variables to store the search bar data
    let page = 0, page_size = 5, total_pages = 1, last_q: SearchBar | null = null,
        q: SearchBar = { sort: 'asc', order: 'name', query: '' }; 

    // -- Create the search menu 
    const search = create_search_bar((q_n) => { 
        q = q_n; if(refresh) refresh();});
    const pagination = create_pagination_bar((new_page) => { 
        page = new_page - 1; if(refresh) refresh();}, total_pages, page);


    // -- Get all the projects
    const lsi = LocalStorage.get_instance();
    const refresh = () => {
        log('INFO', 'Refreshing the list of projects', {
            page, page_size, ...q
        });

        // -- If the query is empty, get all the projects
        if (q.query.length === 0) {
            results = lsi._project_metadata;
            const res_len = results.length;

            // -- Paginate and sort the results
            results = results.slice(page * page_size, page * page_size + page_size);
            results = results.sort((a, b) => {
                if (q.sort === 'asc') return a[q.order] > b[q.order] ? 1 : -1;
                else return a[q.order] < b[q.order] ? 1 : -1;
            });

            // -- Update the variables
            total_pages = Math.ceil(res_len / page_size);
            pagination.set_page_amount(total_pages);
        }

        else {
            // -- If the query is not empty, search for the projects
            const raw_results = lsi.search(
                q.query, 
                'project', 
                page_size, 
                page, 
                q.order, 
                q.sort
            );

            // -- Update the variables
            results = raw_results.results;
            total_pages = raw_results.total_pages;
        }



        // -- Add the results to the list
        if (last_q !== q) {
            page = 0;
            last_q = q;
        }

        pagination.set_page_amount(total_pages);
        pagination.set_page(page + 1);
        add_items_to_list(results, content);
    };


    refresh();


    // -- Add the content to the popup
    const main_parent = document.createElement('div');
    main_parent.appendChild(search);
    main_parent.appendChild(content);
    main_parent.appendChild(pagination.element);

    
    // -- Create the popup
    const prompt = create_popup({
        title: 'Projects',
        message: ``,
        buttons: [],
        auto_close: false,
        close_button: true,
        on_close: () => open = false,
    }, main_parent);
    

    // -- Add a 'search' class to the popup
    prompt.main_elm.setAttribute('search', 'projects');
};