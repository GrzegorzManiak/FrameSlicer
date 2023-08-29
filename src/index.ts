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


// -- Stage
const si = Shortcuts.get_instance();
const ls = FSLocalStorage.get_instance();

let [width, height] = get_client_size();
export const _stage = new konva.Stage({
    container: 'canvas-container',
    width, height,
});

// -- Main Layer
export const _layer = new konva.Layer();
_stage.add(_layer);

init_zoom();
si.reset_shortcuts();
assign_actions();
load_tools();
init_menu();


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

    private constructor() {}

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
    public set_x_line(line: Line | null): void { this._x_line = line; }

    /**
     * @name set_y_line
     * Sets the y line
     *  
     * @param {Line | null} line - The new y line (can be null)
     * 
     * @returns {void}
     */
    public set_y_line(line: Line | null): void { this._y_line = line; }


    // TODO: Add functions to controll the grid


    get stage_identifier(): string { return this._stage_identifier; }
    set stage_identifier(id: string) { this._stage_identifier = id; }

    get stage_use_type(): StageUseType { return this._stage_use_type; }
    set stage_use_type(type: StageUseType) { this._stage_use_type = type; }
}


// -- Create the first instance of the app
export const _app = App.get_instance();

// -- Defualt the x and y lines
const _x_line = new Line(_layer, x_config);
const _y_line = new Line(_layer, y_config);

// -- Set the x and y lines
_app.set_x_line(_x_line);
_app.set_y_line(_y_line);

// -- Render the lines
render_line(_x_line);
render_line(_y_line);




// draw_grid(x_line, true, true);
// draw_grid(y_line, true, false);
handle_controlls(_stage);