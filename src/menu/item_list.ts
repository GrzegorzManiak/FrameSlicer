import { PaginateSort, PaginateOrder, FSProject, FSType } from "../local_storage/index.d";
import { create_button } from "../popups";
import { create_input_group, popup_input } from "../popups/inputs";
import { moment } from "../popups/toasts";
import LocalStorage from '../local_storage';
import { log } from '../log';

export interface SearchBar {
    sort: PaginateSort;
    order: PaginateOrder;
    query: string;
    type: FSType;
}

/**
 * @name create_search_bar
 * Creates a search bar, sort dropdown and an order dropdown
 * 
 * @param {FSType} type - The type of the search menu
 * @param {() => SearchBar} callback - The callback function to call when the search bar changes
 */
export const create_search_bar = (
    type: FSType,
    callback: (search: SearchBar) => void,
) => {

    // -- Size inputs
    const size_group = create_input_group();
    size_group.classList.add('search-bar');

    let sort: PaginateSort = 'asc';
    let order: PaginateOrder = 'name';   
    let query: string = '';

    const search_input = popup_input<string>('Search', '', 'Query', 'text'),
        input_elm = search_input.querySelector('input') as HTMLInputElement;

    // -- Search input that waits for the user to stop typing
    //    before sending the query as the search query might
    //    be expensive
    let last_change = 0, completed = false;
    const search_timeout = 250;
    search_input.addEventListener('input', (e) => {
        completed = false;
        last_change = Date.now();
        const recheck = () => setTimeout(() => {
            if (completed) return;
            if (Date.now() - last_change <= search_timeout) 
                return recheck();
            query = input_elm.value;
            callback({ sort, order, query, type });
            completed = true;
        }, search_timeout);
        recheck();
    });

    // -- Append the inputs
    size_group.appendChild(search_input);
    size_group.appendChild(popup_input<PaginateSort>('Sort', '', ['Asc', 'Desc'], 'dropdown', (v) => {  
        sort = v.toLowerCase() as PaginateSort;
        callback({ sort, order, query, type });
    }));
    size_group.appendChild(popup_input<PaginateOrder>('Order', '', ['Name', 'Created', 'Updated'], 'dropdown', (v) => { 
        order = v.toLowerCase() as PaginateOrder;
        callback({ sort, order, query, type });
    }));

    // -- Check if this is a pattern search menu
    if (type === 'x_pattern' || type === 'y_pattern') { 
        size_group.appendChild(popup_input<string>('Type', '', ['X Axis', 'Y Axis'], 'dropdown', (v) => { 
            if (v === 'X Axis') type = 'x_pattern';
            else type = 'y_pattern';
            callback({ sort, order, query, type });
        }));
    }
    
    // -- Return the search bar
    return size_group;
};



/**
 * @name create_pagination_bar
 * Creates a pagination bar
 * 
 * @param {FSType} type - The type of the search menu
 * @param {(page: number) => void} callback - The callback function to call when the page changes
 * @param {number} page_amount - The amount of pages
 * 
 * @returns {{
 *  element: HTMLDivElement,
 *  set_page: (page: number) => void,
 *  set_page_amount: (amount: number) => void,
 * }} The pagination bar
 */
export const create_pagination_bar = (
    type: FSType,   
    callback: (page: number) => void,
    page_amount: number = 1,
    page: number = 1,
): {
    element: HTMLDivElement,
    set_page: (page: number) => void,
    set_page_amount: (amount: number) => void,
} => {


    // -- Create the pagination bar
    const pagination_bar = create_input_group();
    pagination_bar.classList.add('pagination-bar');
    pagination_bar.setAttribute('popup-section', 'buttons');

    // -- The 'Out of' text
    const out_of = document.createElement('p');
    out_of.innerText = 'out of ' + page_amount;
    out_of.classList.add('pagination-bar-out-of');



    // -- Create the page input
    const page_input = popup_input<number>('', '', '1', 'number', (v) => {
        if (v < 1) v = 1;
        if (v > page_amount) v = page_amount;
        page = v;
        out_of.innerText = `out of ${page_amount}`;
        callback(v);
    });

    // -- Get the page input element
    const page_input_elm = page_input.querySelector('input') as HTMLInputElement;



    // -- Previous / Next buttons
    const previous_button = create_button({
        id: 'previous', text: '', type: 'INFO',
        callback: () => {
            if (page - 1 < 1) return;
            page--;
            page_input_elm.value = page.toString();
            out_of.innerText = `out of ${page_amount}`;
            callback(page);
        }
    });

    const next_button = create_button({
        id: 'next', text: '', type: 'INFO',
        callback: () => {
            if (page + 1 > page_amount) return;
            page++;
            page_input_elm.value = page.toString();
            out_of.innerText = `out of ${page_amount}`;
            callback(page);
        }
    });


    // -- Set the previous / next buttons text to icons
    previous_button.innerHTML = `<i class="fas fa-chevron-left"></i>`;
    next_button.innerHTML = `<i class="fas fa-chevron-right"></i>`;


    // -- Create the middle div which contains the page input and 
    //    the 'out of' text
    const middle = document.createElement('div');
    middle.classList.add('pagination-bar-middle');
    middle.appendChild(page_input);
    middle.appendChild(out_of);


    // -- Append the inputs
    pagination_bar.appendChild(previous_button);
    pagination_bar.appendChild(middle);
    pagination_bar.appendChild(next_button);



    // -- Return the pagination bar controller
    return {
        element: pagination_bar,
        set_page: (new_page: number) => {
            page_input_elm.value = new_page.toString();
            out_of.innerText = `out of ${page_amount}`;
            page = new_page;
        },
        set_page_amount: (amount: number) => {
            page_amount = amount;
            out_of.innerText = `out of ${page_amount}`;
        }
    }
}



/**
 * @name add_items_to_list
 * Adds items to a list
 * 
 * @param {Array<FSProject>} items - The items to add to the list
 * @param {FSType} type - The type of the search menu
 * @param {'load' | 'edit' | 'list'} mode - The mode of the search menu
 * @param {HTMLDivElement} list - The list to add the items to
 * 
 * @returns {void}
 */
export const add_items_to_list = (
    items: Array<FSProject>,
    type: FSType,
    mode: 'load' | 'use' | 'list',
    list: HTMLDivElement,
): void => {
    // -- Clear the list
    list.innerHTML = '';

    const load_btn = `<button popup-button='INFO' class='list-item-action'>Open</button>`,
        use_btn = `<button popup-button='SUCCESS' class='list-item-action'>Use</button>`,
        delete_btn = `<button popup-button='ERROR' class='list-item-action'>Delete</button>`,
        list_btn = `${load_btn}${delete_btn}`;


    // -- Add all the items to the list
    for (const item of items) {
        // -- Format the dates
        const created = new Date(item.created), updated = new Date(item.updated),
            created_formated = `${created.getDate()}/${created.getMonth()}/${created.getFullYear()}`;

        // -- Create the item element   
        const item_elm = document.createElement('div');
        item_elm.classList.add('list-item');
        item_elm.innerHTML = `
            <div class='list-item-icon'>
                <img src='' />
            </div>
            <p class='list-item-title'>${item.name}</p>
            <div class='list-item-dates'>
                <p class='list-item-created'>Created on ${created_formated},</p>
                <p class='list-item-updated'>Last updated ${moment(updated)}.</p>
            </div>
            <div class='list-item-actions' popup-section='buttons'>
                ${mode === 'load' ? load_btn : ''}  
                ${mode === 'use' ? use_btn : ''}
                ${mode === 'list' ? list_btn : ''}  
            </div>
        `;
        list.appendChild(item_elm);
    }

    // -- Check if theres no items  
    if (items.length > 0) return;

    // -- If there are no items, add a no items found message
    const item_elm = document.createElement('div');
    item_elm.classList.add('list-item');
    item_elm.innerHTML = `<p class='list-item-title no-found'>No items found.</p>`;
    list.appendChild(item_elm);
};



/**
 * @name create_search_menu
 * Creates a search menu
 * 
 * @param {FSType} type - The type of the search menu
 * @param {'load' | 'use' | 'list'} mode - The mode of the search menu
 * 
 * @returns {HTMLDivElement} The search menu
 */
export const create_search_menu = (
    type: FSType,
    mode: 'load' | 'use' | 'list',
): HTMLDivElement => {
    // -- Get the metadata refresh function
    const metadata_refresh = () => {
        switch (type) {
            case 'project': return LocalStorage.get_instance()._project_metadata;
            case 'x_pattern': return LocalStorage.get_instance()._x_pattern_metadata;
            case 'y_pattern': return LocalStorage.get_instance()._y_pattern_metadata;
        }
    }


    // -- Create the content
    let results = [], content = create_input_group();
    content.classList.add('list-projects');

    // -- Variables to store the search bar data
    let page = 0, page_size = 5, total_pages = 1, last_q: SearchBar | null = null,
        q: SearchBar = { sort: 'asc', order: 'name', query: '', type }; 

    // -- Create the search menu 
    const search = create_search_bar(type, (q_n) => { 
        q = q_n; if(refresh) refresh();});

    const pagination = create_pagination_bar(type, (new_page) => { 
        page = new_page - 1; if(refresh) refresh();}, total_pages, page);


    // -- Get all the projects
    const lsi = LocalStorage.get_instance();
    const refresh = () => {
        log('INFO', 'Refreshing the list of projects', {
            page, page_size, ...q
        });

        // -- If the query is empty, get all the projects
        if (q.query.length === 0) {
            results = metadata_refresh();
            const res_len = results.length;
            console.log(res_len);

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
                q.query, type, page_size, page, q.order, q.sort);

            // -- Update the variables
            results = raw_results.results;
            total_pages = raw_results.total_pages;
        }



        // -- Add the results to the list
        if (last_q !== q) { page = 0; last_q = q; }

        // -- Update the pagination bar
        pagination.set_page_amount(total_pages);
        pagination.set_page(page + 1);
        add_items_to_list(results, type, mode, content);
    };

    // -- Refresh the list
    refresh();

    // -- Add the content to the popup
    const main_parent = document.createElement('div');
    main_parent.appendChild(search);
    main_parent.appendChild(content);
    main_parent.appendChild(pagination.element);

    // -- Return the content
    return main_parent;
};