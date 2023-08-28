import { log } from '../../log';
import { create_popup } from '../../popups';
import { create_input_group, popup_input } from '../../popups/inputs';
import { create_toast } from '../../popups/toasts';

let open = false;



const open_file_dialog = (
    lock: (lock: boolean) => void = () => {},
    close: () => void = () => {},
) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.fse');

    // -- When the file is selected
    input.addEventListener('change', (e: InputEvent) => {

        // -- Check if a file was selected
        const file_list = (e.target as any)?.files;
        if (!file_list || !file_list[0]) {
            log('INFO', 'No file selected');
            create_toast('warning', 'Import', 'No file selected');
            return lock(false);
        }


        // -- Attempt to read the file
        log('INFO', `Reading file: ${file_list[0].name}`);
        const reader = new FileReader();
        reader.readAsText(file_list[0]);


        // -- When the file is read
        reader.onload = (e) => {
            const file = e.target.result as string;
            log('INFO', `File read: ${file_list[0].name}, ${file.length} bytes`);
            return close();
        };

    });

    // -- When the file dialog is closed
    input.addEventListener('cancel', () => {
        log('INFO', 'File dialog closed');
        create_toast('warning', 'File Import', 'No file selected for import');
        return lock(false);
    });

    // -- Open the file dialog
    input.click();
};



/**
 * @name import_menu_prompt
 * Creates a popup box that asks the user if they
 * want to import a project
 * 
 * @returns {void}
 */
export const import_menu_prompt = () => {

    // -- Check if the popup is already open
    if (open) return;
    open = true;
    
    // -- Create the popup
    const prompt = create_popup({
        title: 'Import',
        message: 'Import a .fse file, this will overwrite your current project, any unsaved changes will be lost.',
        buttons: [{ 
            text: 'Import', 
            type: 'SUCCESS', 
            callback: (lock) => {
                // -- Lock the button
                lock(true);

                // -- Open the file dialog
                open_file_dialog(lock, prompt.close);
            } 
        }],
        auto_close: false,
        close_button: true,
        on_close: () => open = false,
    }, create_input_group().appendChild(
        popup_input(
            'Save project', 
            'Automatically save your project locally',
            'true', 
            'checkbox'
        )
    ));
};