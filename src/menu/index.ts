import App from '..';
import { log } from '../log';
import Shortcuts from '../shortcuts';
import { Shortcut } from '../shortcuts/index.d';
import { export_menu_prompt } from './prompts/export_project';
import { about_menu_prompt } from './prompts/help';
import { import_menu_prompt } from './prompts/import_project';
import { list_patterns } from './prompts/list_patterns';
import { list_projects } from './prompts/list_projects';
import { new_pattern_menu_prompt } from './prompts/new_pattern';
import { save_project_menu_prompt } from './prompts/save_project';

// -- Load the shortcuts
const si = Shortcuts.get_instance();
const menu_bar = document.getElementById('top-menu-bar') as HTMLDivElement;
if (!menu_bar) throw new Error('Could not find the menu bar');
const groups: { [key: string]: {
    parent_elm: HTMLDivElement,
    title_elm: HTMLParagraphElement,
    items_elm: HTMLDivElement,
    shortcuts: Array<Shortcut>,
} } = {};

/**
 * @name assign_actions
 * Assigns the actions to most of the shortcuts
 * that can be found in the menu bar
 * 
 * @returns {void}
 */
export const assign_actions = () => {
    // -- Add the shortcut
    si.assign_action('file-export', export_menu_prompt);
    si.assign_action('file-import', import_menu_prompt);
    si.assign_action('file-list', () => list_projects('Saved projects', 'list'));
    si.assign_action('file-load', () => list_projects('Load saved project', 'load'));

    si.assign_action('help-about', about_menu_prompt);

    si.assign_action('pattern-new', new_pattern_menu_prompt);
    si.assign_action('pattern-list', () => list_patterns('Saved patterns', 'list'));
    si.assign_action('pattern-load', () => list_patterns('Load saved pattern', 'load'));
    si.assign_action('pattern-use', () => list_patterns('Use saved pattern', 'use'));




    // -- THe save shortcut is a bit different, as it needs to be
    //    used by multiple systems such as Projects and Patterns
    si.assign_action('file-save', () => {
        const app = App.get_instance();
        
        if (app.stage_use_type === 'project') {
            log('INFO', 'Saving a "Project"');
            save_project_menu_prompt();
            return;
        }

        if (
            app.stage_use_type === 'x-pattern' ||
            app.stage_use_type === 'y-pattern'
        ) {
            log('INFO', 'Saving a "Pattern"');
            return;
        }

    });
};



/**
 * @name init_menu
 * Initialize the menu bar by addding the
 * shortcuts to the menu bar
 * <div class='selector' menu-bar='file'>
 *  <p>File</p>
 *   <div class='s-spacing'>
 *    <div class='s-options'>
 *     <s-opt option='save'>
 *      <p class='title'>Save</p>
 *      <p class='shortcut'>Ctrl + S</p>
 *     </s-opt>
 *    </div>
 *   </div>
 * </div>
 * 
 * @returns {void}
 */
export const init_menu = () => {
    const items = si.shortcuts;

    // -- Loop through the shortcuts and sort them
    for (const item of items) {
        // -- Get the group
        const group = item.group.toLowerCase();


        // -- If the group exists, add the shortcut
        if (groups[group]) {
            groups[group].shortcuts.push(item);  
            continue;
        }  

        // -- Else create the group and the adjacent elements
        const { 
            group_elm, 
            title_elm, 
            options_elm 
        } = create_dropdown(item.group);

        // -- Add the group to the menu bar
        menu_bar.appendChild(group_elm);

        // -- Create the group object
        groups[group] = {
            parent_elm: group_elm,
            title_elm,
            items_elm: options_elm,
            shortcuts: [item],
        };
    }



    // -- Loop through the groups and add the shortcuts
    for (const group in groups) {
        const group_obj = groups[group],
            items_elm = group_obj.items_elm;

        // -- Loop through the shortcuts
        const menu_break = create_break();
        for (const item of group_obj.shortcuts) {

            // -- If the item is a break, add a break
            if (item?.break === 'before') items_elm.appendChild(menu_break);
            const opt = create_option(item);
            items_elm.appendChild(opt);
            if (item?.break === 'after') items_elm.appendChild(menu_break);

            // -- Add the event listener
            opt.addEventListener('click', () => 
                si.execute_action(item.id));
        }
    }
};



const create_option = (
    shortcut: Shortcut
): HTMLElement => {
    const opt_elm = document.createElement('s-opt');
    opt_elm.setAttribute('option', shortcut.id);

    const title_elm = document.createElement('p');
    title_elm.classList.add('title');
    title_elm.innerText = shortcut.clean;
    opt_elm.appendChild(title_elm);

    const shortcut_elm = document.createElement('p');
    shortcut_elm.classList.add('shortcut');
    shortcut_elm.innerText = Shortcuts.serialize_shortcut(shortcut);
    opt_elm.appendChild(shortcut_elm);

    return opt_elm;
};



export const create_dropdown = (
    title: string,
): {
    group_elm: HTMLDivElement,
    title_elm: HTMLParagraphElement,
    options_elm: HTMLDivElement,
} => {
    // -- Else create the group and the adjacent elements
    const group_elm = document.createElement('div');
    group_elm.classList.add('selector');
    group_elm.setAttribute('menu-bar', title);

    const title_elm = document.createElement('p');
    title_elm.innerText = title;
    group_elm.appendChild(title_elm);

    const spacer = document.createElement('div');
    spacer.classList.add('s-spacing');
    group_elm.appendChild(spacer);

    const options = document.createElement('div');
    options.classList.add('s-options');
    spacer.appendChild(options);

    return {
        group_elm,
        title_elm,
        options_elm: options,
    };
};


const create_break = (
): HTMLElement => {
    // <s-opt class='break'></s-opt>
    const opt_elm = document.createElement('s-opt');
    opt_elm.classList.add('break');
    return opt_elm;
};