import konva from 'konva';
import { get_client_size } from './aux';
import { Colors, LineConfiguration, StageUseType } from './index.d';
import { render_line } from './render';
import { draw_grid } from './render/ruler';
import { handle_controlls } from './canvas/view_controlls';

import Line from './line';
import { init_zoom } from './canvas/zoom';
import { assign_actions, init_menu } from './menu';
import Shortcuts from './shortcuts';
import { load_tools } from './tools';
import FSLocalStorage from './local_storage';

let [width, height] = get_client_size();
export const _stage = new konva.Stage({
    container: 'canvas-container',
    width, height,
});


// -- App debug text
const app_debug = document.getElementById('app-debug');
if (!app_debug) throw new Error('Could not find the app debug element');
app_debug.innerHTML = '';


const line_width = 500;
const line_height = 100;
const line_depth = 60;


export const colors: Colors = {
    anchor: { fill: '#47ffbc', stroke: '#4a4a4a' },
    anchor_guide: { fill: '#108258', stroke: '#108258' },
    ghost_anchor_guide: { fill: '#10825850', stroke: '#10825850' },
    anchor_handle: { fill: '#47ffbc', stroke: '#4a4a4a' },
    ghost_anchor_handle: { fill: '#47ffbc50', stroke: '#4a4a4a50' },
    bounding_box: { fill: '#ffffff10', stroke: '#ffffff15' },
    depth_line: { fill: '#ff3049', stroke: '#eb4034' },
    line: { fill: '#ebebeb30', stroke: '#ebebeb' },
    path: { fill: '#ebebeb30', stroke: '#ebebeb' },
};


export const x_config: LineConfiguration = {
    colors,
    anchor_spread: 10,
    handle_padding: 5,
    size: {
        width: line_width,
        height: line_height,
    },
    cutting_depth: line_depth,
    is_y_line: false,
    y_offset: 0,
    depth_buffer: 20,
    achor_position: 'bottom'
};

export const y_config: LineConfiguration = {
    ...x_config,
    is_y_line: true,
    y_offset: 150 + line_height,
    cutting_depth: x_config.size.height,
    achor_position: 'top',
};

let _app_instance: App = null;
export default class App {
    private _x_line: Line | null = null;
    private _y_line: Line | null = null;

    private _stage_identifier: string = null;
    private _stage_use_type: StageUseType = 'project';

    private _stage: konva.Stage = null;
    private _layer: konva.Layer = null;

    private _window_resize_listeners: Array<() => void> = [];

    // -- Stage
    private _si = Shortcuts.get_instance();
    private _ls = FSLocalStorage.get_instance();

    private constructor() {
        this._update_app_debug();
        this._stage = _stage;
        this._layer = new konva.Layer();
        this._stage.add(this._layer);

        init_zoom();

        assign_actions();
        load_tools();
        init_menu();

        this._si.reset_shortcuts();
        handle_controlls(_stage);
        this._resize_listener();
    }

    private _resize_listener() {
        window.addEventListener('resize', () => this._window_resize_listeners.forEach(
            (listener) => listener()));
    }

    /**
     * @name get_instance
     * Returns the singleton instance of the App class
     * 
     * @returns {App}
     */
    public static get_instance(): App {
        if (!_app_instance) _app_instance = new App();
        return _app_instance;
    }


    
    /**
     * @name reset_layer
     * Resets the layer to its default state, removing
     * all listeners and children
     * 
     * @returns {void}
     */
    public reset_layer(): void {
        // -- Destroy the layer
        this._layer.destroy();
        delete this._layer;
        this._layer = new konva.Layer();
        this._stage.add(this._layer);
    }


    

    /**
     * @name destroy
     * Destroy the current loaded project / pattern
     * and resets the app to its default state
     * 
     * @returns {void}
     */
    public destroy(): void {
        // -- Destroy the lines
        if (this._x_line) {
            this._x_line.destroy();
            delete this._x_line;
        }

        if (this._y_line) {
            this._y_line.destroy();
            delete this._y_line;
        }

        // -- Reset the lines
        this._x_line = null;
        this._y_line = null;

        // -- Reset the stage
        this._stage_identifier = null;
        this._stage_use_type = 'project';

        // -- Reset the layer
        this.reset_layer();
        
        // -- Remove the listeners
        this._window_resize_listeners = [];

        // -- Update the app debug
        this._update_app_debug();
    }



    /**
     * @name get_x_line
     * Returns the x line
     * 
     * @returns {Line}
     */
    public get_x_line(): Line { return this._x_line; }

    /**
     * @name get_y_line
     * Returns the y line
     * 
     * @returns {Line}
     */
    public get_y_line(): Line { return this._y_line; }



    /**
     * @name set_x_line
     * Sets the x line
     * 
     * @param {Line | null} line - The new x line (can be null)
     * 
     * @returns {void}
     */
    public set_x_line(line: Line | null): void { 
        this._x_line = line; 
        this._update_app_debug();
        this._window_resize_listeners.push(line._resize_listener_func)
    }

    /**
     * @name set_y_line
     * Sets the y line
     *  
     * @param {Line | null} line - The new y line (can be null)
     * 
     * @returns {void}
     */
    public set_y_line(line: Line | null): void { 
        this._y_line = line; 
        this._update_app_debug();
        this._window_resize_listeners.push(line._resize_listener_func)
    }


    // TODO: Add functions to controll the grid


    /**
     * @name _update_app_debug
     * Internal function that updates the app debug text
     * 
     * @returns {void}
     */
    private _update_app_debug(): void {
        const SID = this._stage_identifier ? this._stage_identifier.toUpperCase() : 'NONE';
        const SUT = this._stage_use_type ? this._stage_use_type.toUpperCase() : 'NONE';

        const text = `
            SID: ${SID} |
            SUT: ${SUT} |
            X: ${this._x_line ? 'TRUE' : 'FALSE'} |
            Y: ${this._y_line ? 'TRUE' : 'FALSE'}
        `;

        app_debug.innerHTML = text;
    }



    /**
     * @name redraw
     * Redraws the line if possible
     */
    public redraw(): void {
        if (this._x_line) render_line(this._x_line);
        if (this._y_line) render_line(this._y_line);
    }


    get stage_identifier(): string { return this._stage_identifier; }
    set stage_identifier(id: string) { 
        this._stage_identifier = id; 
        this._update_app_debug();
    }

    get stage_use_type(): StageUseType { return this._stage_use_type; }
    set stage_use_type(type: StageUseType) { 
        this._stage_use_type = type; 
        this._update_app_debug();
    }

    get layer(): konva.Layer { return this._layer; }
}


// -- Create the first instance of the app
export const _app = App.get_instance();