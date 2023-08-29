import { validate_line_config } from "../config_validation";
import Line from "../line";
import { log } from "../log";
import { create_toast } from "../popups/toasts";
import { AData, FSProject, ProjectData } from "./index.d";

let _instance: FSLocalStorage | null = null;
export default class FSLocalStorage {

    /**
     * These keys are used to store the data in local storage.
     * 
     * The system works by storing the data in two keys, one
     * for the data and one for the meta data. The meta data
     * is used to be quick and easy to access the data, while
     * the data is used to store the actual data.
     * 
     * Note: there is a 5mb limit on local storage, so we
     * need to be careful with how much data we store.
     */
    private _project_key: string = 'fls-project';
    private _project_data_key: string = 'fls-project-data';
    private _project_metadata: Array<FSProject> = [];

    private _y_pattern_key: string = 'fls-y-pattern';
    private _y_pattern_data_key: string = 'fls-y-pattern-data';
    private _y_pattern_metadata: Array<FSProject> = [];

    private _x_pattern_key: string = 'fls-x-pattern';
    private _x_pattern_data_key: string = 'fls-x-pattern-data';
    private _x_pattern_metadata: Array<FSProject> = [];

    private _MAX_SIZE: number = 5000000; // -- 5mb
    private _WARN_SIZE: number = 4000000; // -- 4mb
    private _ls_lock: boolean = false;  

    

    // -- Private constructor to prevent multiple instances
    private constructor() {
        log('INFO', 'Creating local storage instance');
        
        // -- CHeck if local storage is available
        if (!this.local_storage_available()) {
            log('ERROR', 'Local storage is not available');
            throw new Error('Local storage is not available');
        }
        
        // -- Instantiate the keys
        this._instantiate_key(this._project_key);
        this._instantiate_key(this._project_data_key);

        this._instantiate_key(this._y_pattern_key);
        this._instantiate_key(this._y_pattern_data_key);

        this._instantiate_key(this._x_pattern_key);
        this._instantiate_key(this._x_pattern_data_key);

        // -- Check the size of local storage
        const size = FSLocalStorage.current_ls_size();
        log('INFO', `Local storage size: ${size} bytes, ${(size / this._MAX_SIZE) * 100}% full`);

        if (size > this._MAX_SIZE) {
            log('ERROR', 'Local storage is full');
            this._ls_lock = true;
            create_toast('error', 'Local storage is full', 'Please clear / export some projects and try again');
        }

        // -- Check if local storage is almost full
        else if (size > this._WARN_SIZE) {
            log('WARN', 'Local storage is almost full');
            create_toast('warning', 'Local storage is almost full', 'Please clear / export some projects');
        }

        // -- Get the metadata
        this.get_projects_metadata();
        this.get_x_patterns_metadata();
        this.get_y_patterns_metadata();

        log('INFO', 'Local storage instance created');
    }



    /**
     * @name _instantiate_key
     * Internal function to instantiate a key
     * in local storage
     * 
     * @param {string} key - The key to instantiate
     *
     * @returns {void} nothing
     */
    private _instantiate_key(
        key: string
    ): void {
        // -- Get the value from local storage
        let value = localStorage.getItem(key);

        // -- Check if the value is null
        if (value === null) 
            localStorage.setItem(key, JSON.stringify([]));
    }



    /**
     * @name get_instance
     * Get the singleton instance of the Shortcuts class
     * 
     * @returns {Shortcuts} - The singleton instance of the Shortcuts class
     */
    public static get_instance(
    ): FSLocalStorage {
        if (_instance === null) _instance = new FSLocalStorage();
        return _instance;
    }



    /**
     * @name local_storage_available
     * Checks if local storage is available on
     * the users browser
     * 
     * @returns {boolean} - True if local storage is available
     */
    public local_storage_available(
    ): boolean {
        return typeof(Storage) !== 'undefined';
    }



    /**
     * @name current_ls_size
     * Get the current size of local storage
     * in bytes
     * 
     * @returns {number} - The size of local storage in bytes
     */
    public static current_ls_size(
    ): number {
        let size = 0;

        // -- Loop through all the keys
        for (let key in localStorage) {
            if (!localStorage.hasOwnProperty(key)) continue;

            // -- Get the size of the key
            let value = localStorage[key];
            size += value.length;
        }

        // -- Return the size
        return size;
    }


    
    /**
     * @name string_byte_size
     * Get the size of a string in bytes
     * 
     * @param {string} str - The string to get the size of
     * 
     * @returns {number} - The size of the string in bytes
     */
    public static string_byte_size(
        str: string
    ): number {
        return new Blob([str]).size;
    }



    /**
     * @name get_fsprojects
     * Get the projects from local storage by key
     * as all the projects are stored in the same
     * format
     * 
     * @param {string} key - The key to get the projects from
     * 
     * @returns {FSProject[]} - The projects
     */
    public get_fsprojects(
        key: string
    ): FSProject[] {
        // -- Get the data from local storage
        const data = localStorage.getItem(key);

        // -- Check if the data is null
        if (data === null) {
            log('ERROR', `Failed to get data from local storage with key: ${key}`);
            return [];
        }

        // -- Parse the data
        let projects: FSProject[] = [];
        try { projects = JSON.parse(data); } 
        catch (e) {
            log('ERROR', `Failed to parse data from local storage with key: ${key}`);
            return [];
        }

        const processed_projects: FSProject[] = [];
        for (let project of projects) {
            
            // -- Ensure that the 'type', 'name', 
            //    'created' and 'updated' properties exist
            if (
                typeof project.type !== 'string' ||
                typeof project.name !== 'string' ||
                typeof project.created !== 'number' ||
                typeof project.updated !== 'number'
            ) continue;

            // -- Depending on the type, ensure that the
            //    values are correct
            switch (project.type) {
                case 'project':
                    // -- Ensure that the 'x_meta' and 'y_meta' properties exist
                    if (
                        typeof project.x_meta !== 'object' ||
                        typeof project.y_meta !== 'object'
                    ) continue;

                    // -- Ensure that those properties have the correct values
                    if (
                        validate_line_config(project.x_meta) !== true ||
                        validate_line_config(project.y_meta) !== true
                    ) continue;

                    // -- Break out of the switch 
                    break;


                case 'x_pattern':
                    // -- Ensure that the 'x_meta' property exists
                    if (typeof project.x_meta !== 'object') continue;

                    // -- Ensure that the property has the correct value
                    if (validate_line_config(project.x_meta) !== true) continue;

                    // -- Break out of the switch 
                    break;


                case 'y_pattern':
                    // -- Ensure that the 'y_meta' property exists
                    if (typeof project.y_meta !== 'object') continue;
                        
                    // -- Ensure that the property has the correct value
                    if (validate_line_config(project.y_meta) !== true) continue;
                    
                    // -- Break out of the switch
                    break;
            };

            // -- Add the project to the processed projects
            processed_projects.push(project);
        }


        // -- Return the projects
        return processed_projects;
    }



    /**
     * @name ensure_unique_project_name
     * Ensure that the name is unique
     * 
     * @param {string} name - The name to check
     * 
     * @returns {boolean} - True if the name is unique
     */
    public ensure_unique_project_name(
        name: string
    ): boolean {

        // -- Loop through the projects
        for (let project of this._project_metadata) {
            if (project.name.toLowerCase() === name.toLowerCase()) 
                return false;
        }

        // -- Return true
        return true;
    }



    /**
     * @name ensure_unique_pattern_name
     * Ensure that the name is unique
     * 
     * @param {string} name - The name to check
     * 
     * @returns {boolean} - True if the name is unique
     */
    public ensure_unique_pattern_name(
        name: string
    ): boolean {

        // -- Get both the x and y patterns
        const patterns = [
            ...this._x_pattern_metadata,
            ...this._y_pattern_metadata,
        ];

        // -- Loop through the projects
        for (let pattern of patterns) {
            if (pattern.name.toLowerCase() === name.toLowerCase()) 
                return false;
        }

        // -- Return true
        return true;
    }



    /**
     * @name _create_data_key
     * Internal function to create a data key
     * to store the data in local storage
     * 
     * @param {string} key - The key to create the data key for
     * @param {string} name - The name of the project
     * 
     * @returns {string} - The data key
     */
    private _create_data_key(
        key: string,
        name: string,
    ): string {
        return `${key}-${name}`;
    }



    /**
     * @name get_projects_metadata
     * Gets the metadata for all projects and
     * sets it to the _projects_metadata variable
     * 
     * @returns {FSProject[]} - The metadata for all projects
     */
    public get_projects_metadata(
    ): FSProject[] {
        // -- Get the projects metadata
        const projects = this.get_fsprojects(this._project_key);
        this._project_metadata = projects;
        return projects;
    }
        


    /**
     * @name get_x_patterns_metadata
     * Gets the metadata for all x patterns and
     * sets it to the _x_pattern_metadata variable
     * 
     * @returns {FSProject[]} - The metadata for all x patterns
     */
    public get_x_patterns_metadata(
    ): FSProject[] {
        // -- Get the x patterns metadata
        const projects = this.get_fsprojects(this._x_pattern_key);
        this._x_pattern_metadata = projects;
        return projects;
    }



    /**
     * @name get_y_patterns_metadata
     * Gets the metadata for all y patterns and
     * sets it to the _y_pattern_metadata variable
     *  
     * @returns {FSProject[]} - The metadata for all y patterns
     */
    public get_y_patterns_metadata(
    ): FSProject[] {
        // -- Get the y patterns metadata
        const projects = this.get_fsprojects(this._y_pattern_key);
        this._y_pattern_metadata = projects;
        return projects;
    }



    /**
     * @name _save_project
     * Internal function to save the project
     * to local storage
     * 
     * @param {FSProject} meta - The metadata for the project
     * @param {ProjectData} data - The data for the project
     * 
     * @returns {void} nothing
     */
    private _save_project(
        meta: FSProject,
        data: ProjectData,
    ): void {
        // -- Get the data from local storage
        const projects = this.get_fsprojects(this._project_key),
            data_key = this._create_data_key(this._project_data_key, meta.name);

        // -- Add the project to the projects
        projects.push(meta);

        // -- Save the projects
        localStorage.setItem(this._project_key, JSON.stringify(projects));
        localStorage.setItem(data_key, JSON.stringify(data));
    }



    /**
     * @name _save_pattern
     * Internal function to save the pattern
     * to local storage
     * 
     * @param {'x' | 'y'} type - The type of pattern to save
     * @param {FSProject} meta - The metadata for the pattern
     * @param {AData} data - The data for the pattern
     * 
     * @returns {void} nothing
     */
    private _save_pattern(
        type: 'x' | 'y',
        meta: FSProject,
        data: AData,
    ): void {
        // -- Get the data from local storage
        const key = type === 'x' ? this._x_pattern_key : this._y_pattern_key,
            ls_data_key = type === 'x' ? this._x_pattern_data_key : this._y_pattern_data_key,
            data_key = this._create_data_key(ls_data_key, meta.name),
            projects = this.get_fsprojects(key);

        // -- Add the project to the projects
        projects.push(meta);

        // -- Save the projects
        localStorage.setItem(this._project_key, JSON.stringify(projects));
        localStorage.setItem(data_key, JSON.stringify(data));
    }



    /**
     * @name save_project
     * Save the project to local storage
     * 
     * @param {string} name - The name of the project
     * @param {Line} x_line - The x line
     * @param {Line} y_line - The y line
     * @param {number} [created=Date.now()] - The time the project was created
     * @param {number} [updated=Date.now()] - The time the project was updated
     *
     * @returns {boolean} - True if the pattern was saved
     */
    public save_project(
        name: string,
        x_line: Line,
        y_line: Line,
        created: number = Date.now(),
        updated: number = Date.now(),
    ): boolean {

        // -- Serialize the data
        const x_line_data = x_line.serialize();
        const y_line_data = y_line.serialize();

        // -- Calculate the size of the data
        const x_line_size = FSLocalStorage.string_byte_size(x_line_data);
        const y_line_size = FSLocalStorage.string_byte_size(y_line_data);

        // -- Check if the data is too big
        if (x_line_size + y_line_size > this._MAX_SIZE) {
            log('ERROR', 'Project is too big to save');
            create_toast('error', 'Project is too big to save', 'Please export the project and try again');
            return false;
        }

        // -- Check if the name is unique
        if (!this.ensure_unique_project_name(name)) {
            log('ERROR', `Project name is not unique: ${name}`);
            create_toast('error', 'Project name is not unique', 'Please choose a different name');
            return false;
        }

        // -- Construct the metadata object
        const meta: FSProject = {
            name,
            created, updated,
            type: 'project',
            x_meta: x_line.config,
            y_meta: y_line.config,
            preview: '',
        };

        // -- Construct the data object
        const data: ProjectData = {
            x: x_line.serialized_anchors,
            y: y_line.serialized_anchors,
        };

        // -- Save the data
        this._save_project(meta, data);

        // -- Update the metadata
        this.get_projects_metadata();
        return true;
    }



    /**
     * @name save_pattern
     * Save the pattern to local storage
     * 
     * @param {string} name - The name of the pattern
     * @param {Line} line - The line
     * @param {number} [created=Date.now()] - The time the pattern was created
     * @param {number} [updated=Date.now()] - The time the pattern was updated
     * 
     * @returns {boolean} - True if the pattern was saved
     */
    public save_pattern(
        name: string,
        line: Line,
        created: number = Date.now(),
        updated: number = Date.now(),
    ): boolean {
            
        // -- Serialize the data
        const line_data = line.serialize();

        // -- Calculate the size of the data
        const line_size = FSLocalStorage.string_byte_size(line_data);

        // -- Check if the data is too big
        if (line_size > this._MAX_SIZE) {
            log('ERROR', 'Pattern is too big to save');
            create_toast('error', 'Pattern is too big to save', 'Please export the pattern and try again');
            return false;
        }

        // -- Check if the name is unique
        if (!this.ensure_unique_pattern_name(name)) {
            log('ERROR', `Pattern name is not unique: ${name}`);
            create_toast('error', 'Pattern name is not unique', 'Please choose a different name');
            return false;
        }

        // -- Construct the metadata object
        const meta: FSProject = {
            name,
            created, updated,
            type: line.config.is_y_line ? 'y_pattern' : 'x_pattern',
            x_meta: line.config.is_y_line ? undefined : line.config,
            y_meta: line.config.is_y_line ? line.config : undefined,
            preview: '',
        };

        // -- Construct the data object
        const data: AData = line.serialized_anchors;

        // -- Save the data
        this._save_pattern(line.config.is_y_line ? 'y' : 'x', meta, data);

        // -- Update the metadata
        if (line.config.is_y_line) this.get_y_patterns_metadata();
        else this.get_x_patterns_metadata();
        return true;
    }



    /**
     * @name get_project
     * Get a project's metadata from local storage
     * 
     * @param {string} name - The name of the project
     *
     * @returns {FSProject | null} - The project or null if it doesn't exist
     */
    public get_project(
        name: string,
    ): FSProject | null {
        // -- Loop through the projects
        for (let project of this._project_metadata) {
            if (project.name.toLowerCase() === name.toLowerCase()) 
                return project;
        }

        // -- Return null
        return null;
    }
    


    /**
     * @name delete_project
     * Function to delete a project from local storage
     * 
     * @param {string} name - The name of the project
     * 
     * @returns {boolean} - True if the project was deleted
     */
    public delete_project(
        name: string,
    ): boolean {
        // -- If the project doesn't exist, it could be still
        //    in local storage, so we need to check that
        let deleted = true;

        // -- Attempt to get the project
        const project = this.get_project(name);
        if (project === null) {
            log('ERROR', `Failed to get project with name: ${name}`);
            deleted = false;
        }

        // -- Attempt to remove the project from ls
        const data_key = this._create_data_key(this._project_data_key, name);
        localStorage.removeItem(data_key);

        // -- Attempt to remove the project from the metadata
        const index = this._project_metadata.indexOf(project);
        if (index === -1) {
            log('ERROR', `Failed to get project with name: ${name}`);
            deleted = false;
        }

        // -- Remove the project from the metadata
        this._project_metadata.splice(index, 1);

        // -- Save the metadata
        localStorage.setItem(
            this._project_key, 
            JSON.stringify(this._project_metadata)
        );

        // -- Return true, and reload the metadata
        this.get_projects_metadata();
        return deleted;
    };



    /**
     * @name _get_pattern
     * Internal function to get a pattern's metadata
     * 
     * @param {'x' | 'y'} type - The type of pattern to get
     * @param {string} name - The name of the pattern
     * 
     * @returns {FSProject | null} - The pattern or null if it doesn't exist
     */
    private _get_pattern(
        type: 'x' | 'y',
        name: string,
    ): FSProject | null {
        // -- Get the key
        const key = type === 'x' ? this._x_pattern_key : this._y_pattern_key,
            patterns = key === 'x' ? this._x_pattern_metadata : this._y_pattern_metadata;


        // -- Loop through the projects
        for (let pattern of patterns) {
            if (pattern.name.toLowerCase() === name.toLowerCase()) 
                return pattern;
        }
        
        // -- Return null
        return null;
    }



    /**
     * @name get_x_pattern
     * Get an x pattern's metadata from local storage
     * 
     * @param {string} name - The name of the pattern
     * 
     * @returns {FSProject | null} - The pattern or null if it doesn't exist
     */
    public get_x_pattern(
        name: string,
    ): FSProject | null {
        return this._get_pattern('x', name);
    }



    /**
     * @name get_y_pattern
     * Get a y pattern's metadata from local storage
     * 
     * @param {string} name - The name of the pattern
     * 
     * @returns {FSProject | null} - The pattern or null if it doesn't exist
     */
    public get_y_pattern(
        name: string,
    ): FSProject | null {
        return this._get_pattern('y', name);
    }



    /**
     * @name _delete_pattern
     * Internal function to delete a pattern
     * 
     * @param {'x' | 'y'} type - The type of pattern to delete
     * @param {string} name - The name of the pattern
     * 
     * @returns {boolean} - True if the pattern was deleted
     */
    private _delete_pattern(
        type: 'x' | 'y',
        name: string,
    ): boolean {
        // -- If the pattern doesn't exist, it could be still
        //    in local storage, so we need to check that
        let deleted = true;

        // -- Attempt to get the project
        const project = this._get_pattern(type, name);
        if (project === null) {
            log('ERROR', `Failed to get project with name: ${name}`);
            deleted = false;
        }

        // -- Attempt to remove the project from ls
        const pattern_data_key = type === 'x' ? this._x_pattern_data_key : this._y_pattern_data_key;
        const pattern_metadata = type === 'x' ? this._x_pattern_metadata : this._y_pattern_metadata;

        const data_key = this._create_data_key(pattern_data_key, name);
        localStorage.removeItem(data_key);

        // -- Attempt to remove the project from the metadata
        const index = pattern_metadata.indexOf(project);
        if (index === -1) {
            log('ERROR', `Failed to get pattern with name: ${name}`);
            deleted = false;
        }

        // -- Remove the project from the metadata
        pattern_metadata.splice(index, 1);

        // -- Save the metadata
        localStorage.setItem(
            this._project_key, 
            JSON.stringify(pattern_metadata)
        );

        // -- Return true, and reload the metadata
        if (type === 'x') this.get_x_patterns_metadata();
        else this.get_y_patterns_metadata();
        return deleted;
    };



    /**
     * @name delete_x_pattern
     * Delete an x pattern from local storage
     * 
     * @param {string} name - The name of the pattern
     * 
     * @returns {boolean} - True if the pattern was deleted
     */
    public delete_x_pattern(
        name: string,
    ): boolean {
        return this._delete_pattern('x', name);
    }



    /**
     * @name delete_y_pattern
     * Delete a y pattern from local storage
     * 
     * @param {string} name - The name of the pattern
     * 
     * @returns {boolean} - True if the pattern was deleted
     */
    public delete_y_pattern(
        name: string,
    ): boolean {
        return this._delete_pattern('y', name);
    }



    /**
     * @name get_project_data
     * Get a project's data from local storage
     * 
     * @param {string} name - The name of the project
     */
    public get_project_data(
        name: string,
    ): ProjectData | null {
        const data_key = this._create_data_key(this._project_data_key, name),
            data = localStorage.getItem(data_key) as unknown as ProjectData;

        // -- Ensure that the data is in the correct format
        if (
            typeof data !== 'object' ||
            typeof data.x !== 'object' ||
            typeof data.y !== 'object'
        ) return null;

        // -- Loop through the data and ensure that it is in the correct format
        for (let anchor of data.x) {
            if (
                typeof anchor.x !== 'number' ||
                typeof anchor.y !== 'number'
            ) return null;
        }

        for (let anchor of data.y) {
            if (
                typeof anchor.x !== 'number' ||
                typeof anchor.y !== 'number'
            ) return null;
        }

        // -- Return the data
        return data;
    }



    /**
     * @name _get_pattern_data
     * Internal function to get a pattern's data
     * 
     * @param {'x' | 'y'} type - The type of pattern to get
     * @param {string} name - The name of the pattern
     * 
     * @returns {AData | null} - The pattern's data or null if it doesn't exist
     */
    private _get_pattern_data(
        type: 'x' | 'y',
        name: string,
    ): AData | null {
        const pattern_data_key = type === 'x' ? this._x_pattern_data_key : this._y_pattern_data_key,
            data_key = this._create_data_key(pattern_data_key, name),
            data = localStorage.getItem(data_key) as unknown as AData;

        // -- Ensure that the data is in the correct format
        if (
            typeof data !== 'object'
        ) return null;

        // -- Loop through the data and ensure that it is in the correct format
        for (let anchor of data) {
            if (
                typeof anchor.x !== 'number' ||
                typeof anchor.y !== 'number'
            ) return null;
        }

        // -- Return the data
        return data;
    }



    /**
     * @name get_x_pattern_data
     * Get an x pattern's data from local storage
     * 
     * @param {string} name - The name of the pattern
     * 
     * @returns {AData | null} - The pattern's data or null if it doesn't exist
     */
    public get_x_pattern_data(
        name: string,
    ): AData | null {
        return this._get_pattern_data('x', name);
    }



    /**
     * @name get_y_pattern_data
     * Get a y pattern's data from local storage
     * 
     * @param {string} name - The name of the pattern
     * 
     * @returns {AData | null} - The pattern's data or null if it doesn't exist
     */
    public get_y_pattern_data(
        name: string,
    ): AData | null {
        return this._get_pattern_data('y', name);
    }



    /**
     * @name update_project
     * Update a project in local storage, the project
     * must already exist.
     * 
     * @param {string} name - The name of the project
     * @param {Line} x_line - The x line
     * @param {Line} y_line - The y line
     * 
     * @returns {boolean} - True if the project was updated
     */
    public update_project(
        name: string,
        x_line: Line,
        y_line: Line,
    ): boolean {
        // -- Get the project
        const project = this.get_project(name);
        if (project === null) {
            log('ERROR', `Failed to get project with name: ${name}`);
            return false;
        }

        // -- Ensure that there is enough space
        const x_line_data = x_line.serialize();
        const y_line_data = y_line.serialize();

        // -- Calculate the size of the data
        const x_line_size = FSLocalStorage.string_byte_size(x_line_data);
        const y_line_size = FSLocalStorage.string_byte_size(y_line_data);

        // -- Check if the data is too big
        if (x_line_size + y_line_size > this._MAX_SIZE) {
            log('ERROR', 'Project is too big to save');
            create_toast('error', 'Project is too big to save', 'Please export the project and try again');
            return false;
        }
        
        // -- Delete the project
        const delted = this.delete_project(name);
        if (!delted) {
            log('ERROR', `Failed to delete project with name: ${name}`);
            return false;
        }

        // -- Save the project
        return this.save_project(
            name, 
            x_line, 
            y_line,
            project.created,
        );
    }



    /**
     * @name update_pattern
     * Update a pattern in local storage, the pattern
     * must already exist.
     * 
     * @param {string} name - The name of the pattern
     * @param {Line} line - The line
     * 
     * @returns {boolean} - True if the pattern was updated
     */
    public update_pattern(
        name: string,
        line: Line,
    ): boolean {
        // -- Get the pattern
        const project = line.config.is_y_line ? this.get_y_pattern(name) : this.get_x_pattern(name);
        if (project === null) {
            log('ERROR', `Failed to get pattern with name: ${name}`);
            return false;
        }

        // -- Ensure that there is enough space
        const line_data = line.serialize();

        // -- Calculate the size of the data
        const line_size = FSLocalStorage.string_byte_size(line_data);

        // -- Check if the data is too big
        if (line_size > this._MAX_SIZE) {
            log('ERROR', 'Pattern is too big to save');
            create_toast('error', 'Pattern is too big to save', 'Please export the pattern and try again');
            return false;
        }

        // -- Delete the pattern
        const delted = line.config.is_y_line ? this.delete_y_pattern(name) : this.delete_x_pattern(name);
        if (!delted) {
            log('ERROR', `Failed to delete pattern with name: ${name}`);
            return false;
        }

        // -- Save the pattern
        return this.save_pattern(
            name, 
            line, 
            project.created,
        );
    }
}