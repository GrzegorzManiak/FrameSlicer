import konva, {} from 'konva';
import { Anchor, Colors, GhostAnchor, LineConfiguration } from './index.d';
import { render_line } from './render';
import { get_client_size } from './aux';
import { log } from './log';
import { KonvaEventObject } from 'konva/lib/Node';
import { append_listener, get_active_tool } from './tools/loader';
import { ToolObject } from './tools/index.d';

export default class Line {
    readonly _line: konva.Line;
    readonly _path: konva.Path;
    readonly _handle: konva.Shape;
    readonly _anchor: konva.Shape;
    readonly _depth_line: konva.Line;
    readonly _bounding_box: konva.Rect;
    readonly _layer: konva.Layer;

    private _config: LineConfiguration;
    private _colors: Colors;
    private _anchors: Array<Anchor>;
    private _raw_path: string;
    private _ghost_anchor: GhostAnchor;

    private _position: { x: number, y: number } = { x: 0, y: 0 };

    public constructor(
        layer: konva.Layer,
        config: LineConfiguration,
        init_anchors: boolean = true
    ) {
        const [c_width, c_height] = get_client_size();
        const c_center_x = c_width / 2 - config.size.width / 2,
            c_center_y = c_height / 2 - config.size.height / 2;   

        // -- Line
        this._line = new konva.Line({
            points: [],
            stroke: config.colors.line.stroke,
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: false,
            fill: config.colors.line.fill,
            closed: false,
        });


        // -- Depth line
        this._depth_line = new konva.Line({
            points: [],
            stroke: config.colors.depth_line.stroke,
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: false,
            fill: config.colors.depth_line.fill,
            closed: false,
        });


        // -- Path
        this._path = new konva.Path({
            data: '',
            stroke: config.colors.path.stroke,
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: false,
            fill: config.is_y_line ? 'transparent' : config.colors.path.fill,
            closed: false,
        });


        // -- Bounding box
        this._bounding_box = new konva.Rect({
            x: c_center_x,
            y: c_center_y,
            width: config.size.width,
            height: config.size.height,
            stroke: config.colors.bounding_box.stroke,
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: false,
            fill: config.colors.bounding_box.fill,
            closed: false,
        });


        // -- Handle
        this._handle = new konva.Rect({
            x: 0,
            y: 0,
            width: 10,
            height: 25,
            stroke: config.colors.anchor_handle.stroke,
            strokeWidth: 1,
            fill: config.colors.anchor_handle.fill,
            draggable: true,
        });


        // -- Anchor
        this._anchor = new konva.Rect({
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            stroke: config.colors.anchor.stroke,
            strokeWidth: 1,
            fill: config.colors.anchor.fill,
            draggable: true,
        });

        this._ghost_anchor = {
            anchor: new konva.Rect({
                x: 0,
                y: 0,
                width: 10,
                height: 25,
                stroke: config.colors.ghost_anchor_handle.stroke,
                strokeWidth: 1,
                fill: config.colors.ghost_anchor_handle.fill,
                draggable: true,
            }),

            line: new konva.Line({
                points: [],
                stroke: config.colors.ghost_anchor_guide.stroke,
                strokeWidth: 2,
                lineCap: 'round',
                lineJoin: 'round',
                draggable: false,
                fill: config.colors.ghost_anchor_guide.fill,
                closed: false,
                zIndex: 100,
            }),
        };

        // -- Add the elements
        layer.add(this._line);
        layer.add(this._path);
        layer.add(this._bounding_box);
        layer.add(this._depth_line);
        layer.add(this._ghost_anchor.anchor);
        layer.add(this._ghost_anchor.line);


        // -- Hide the depth line if it's a y line
        if (config.is_y_line) 
            this._depth_line.hide();


        // -- Set the variables
        this._layer = layer;
        this._config = config;
        this._colors = config.colors;
        this._raw_path = '';

        // -- Set the position (top left)
        this._position = {
            x: this._bounding_box.position().x,
            y: this._bounding_box.position().y,
        };


        // -- Initialize the anchors
        this._anchors = [];
        if (init_anchors)
        this._init_anchors();
        Line._resize_listener(this);
        this._ghost_anchor_listener();
        this._remove_anchor_listener();
    }



    /**
     * @name set_path
     * Sets the path of the line and
     * draws the line
     * 
     * @param {string} path - The path to be set
     * 
     * @returns {void}
     */
    public set_path(
        path: string
    ): void {
        this._raw_path = path;
        this._path.data(this._raw_path);
        this._layer.batchDraw();
    }



    /**
     * @name _add_anchor_elements
     * Adds an anchor to the line
     * 
     * @param {number} x - The x position of the anchor
     * @param {number} y - The y position of the anchor
     * 
     * @returns {Anchor} The anchor that was added
     */
    private _add_anchor_elements(
        x: number = 0, 
        y: number = 0
    ): Anchor {
        // -- Clone the anchor
        const anchor = this._anchor.clone({
            x, y
        });

        // -- Create the anchor object
        const anchor_object: Anchor = {
            shape: anchor,
            line: new konva.Line({
                points: [],
                stroke: this._colors.anchor_guide.stroke,
                strokeWidth: 2,
                lineCap: 'round',
                lineJoin: 'round',
                draggable: false,
                fill: this._colors.anchor_guide.fill,
                closed: false,
                zIndex: 100,
            }),
            handle: this._handle.clone({x, y}),
            max_y: 0,
            min_y: 0,
            handle_y: 0,
            handle_neg_y: 0,
            position: { x, y },
        };


        // -- Add the new elements
        this._layer.add(anchor_object.line);
        this._layer.add(anchor_object.shape);
        this._layer.add(anchor_object.handle);
        this._layer.draw();
        this._anchors.push(anchor_object);

        // -- Add the event listeners
        Line._anchor_listener(this, anchor_object);
        Line._handle_listener(this, anchor_object);

        // -- Return the anchor
        return anchor_object;
    }   


    /**
     * @name init_anchors
     * Initializes the anchors for a line
     * 
     * @returns {void} Nothing
     */
    private _init_anchors(
    ): void {
        let [c_width, c_height] = get_client_size();

        // -- Some calculations
        const width = this.width,
            height = this.height;

        // -- Set the spread
        const anchor_ammount = width / this._config.anchor_spread;

        // -- Calculate the center of the screen
        const offset_left = c_width / 2 - width / 2,
            offset_top = c_height / 2 - height / 2;

        // -- Create the anchors
        for (let i = 0; i < this._config.anchor_spread + 1; i++) {
            this._add_anchor(
                offset_left + anchor_ammount * i,
                offset_top - this._config.y_offset,
            );
        }
    }



    /**
     * @name add_anchor
     * Adds an anchor to the line, internall function
     * use the public add_anchor function instead.
     * 
     * @param {number} x The x position of the anchor
     * @param {number} y The y position of the anchor
     * 
     * @returns {Anchor} The anchor that was added
     */
    public _add_anchor( 
        x: number, 
        y: number
    ): Anchor {
        // -- Create the anchor
        const anchor = this._add_anchor_elements(),
        a_size = anchor.shape.size();

        // -- Center the anchor
        const anchor_y = this._config.is_y_line ? 
            y - a_size.height / 2 + (this._config.cutting_depth / 2):
            y - a_size.height / 2;

        anchor.shape.position({ 
            x: x - a_size.width / 2,
            y: anchor_y
        });


        // -- Set the bounds
        anchor.max_y = y + this._config.cutting_depth;
        anchor.min_y = y;

        // -- Handle
        const handle = anchor.handle;
        anchor.handle_y = y + this._config.cutting_depth + this._config.handle_padding;
        anchor.handle_neg_y = y - this._config.handle_padding - handle.height();
        
        handle.position({
            x: x - handle.width() / 2,
            y: this._config.achor_position === 'bottom' ? anchor.handle_y : anchor.handle_neg_y
        });

        anchor.position = this.get_anchor_percent(anchor);

        // -- Return the anchor
        return anchor;
    };



    /**
     * @name _calculate_anchor_position
     * Calculates the anchor position based on percentages
     * 
     * @param {number} x_percent - The x position of the anchor in percent (0 start - 1 end)
     * @param {number} y_percent - The y position of the anchor in percent (0 top - 1 bottom)
     * 
     * @returns {{x: number, y: number}} The calculated position of the anchor
     */
    public _calculate_anchor_position(
        x_percent: number = 0,
        y_percent: number = 0,
    ): {
        x: number,
        y: number,
    } {
        // -- Bounding box
        const pos = this.position,
            size = this.config.size;

        // -- Anchor center
        const anchor_center = {
            x: pos.x + x_percent * size.width,
            y: (pos.y - this.config.y_offset) + y_percent * size.height,
        };

        // -- Return the anchor center
        return anchor_center;
    }



    /**
     * @name add_anchor
     * Adds an anchor to the line
     * 
     * @param {number} x_percent - The x position of the anchor in percent (0 start - 1 end)
     * @param {number} y_percent - The y position of the anchor in percent (0 top - 1 bottom)
     * 
     * @returns {Anchor} The anchor that was added
     */
    public add_anchor(
        x_percent: number = 0,
        y_percent: number = 0
    ): Anchor {
        // -- Clamp the values
        x_percent = Math.max(0, Math.min(1, x_percent));
        y_percent = Math.max(0, Math.min(1, y_percent));

        // -- Calculate the anchor position
        const anchor_center = this._calculate_anchor_position(
            x_percent, 
            y_percent
        );

        // -- Add the anchor
        const anchor = this._add_anchor(
            anchor_center.x,
            this.position.y - this.config.y_offset
        );

        anchor.shape.position({
            x: anchor.shape.position().x,
            y: anchor_center.y - anchor.shape.height() / 2,
        });

        // -- Return the anchor
        return anchor;
    }




    /**
     * @name get_anchor_percent
     * Gets the position of an anchor in percent
     * 
     * @param {Anchor} anchor - The anchor to get the position of
     * 
     * @returns {{
     *    x: number,    
     *    y: number
     * }} The position of the anchor in percent
     */
    public get_anchor_percent(
        anchor: Anchor
    ): { x: number, y: number } {
        // -- Handle
        const handle_pos = anchor.shape.position(),
            handle_size = anchor.shape.size();

        // -- Bounding box
        const pos = this.position,
            size = this.config.size;

        // -- Handle center
        const handle_center = { 
            x: handle_pos.x + handle_size.width / 2,
            y: handle_pos.y + handle_size.height / 2,
        }

        // -- Return the percent
        return {
            x: Math.abs((handle_center.x - pos.x) / size.width), 
            y: Math.abs((handle_center.y - (pos.y - this.config.y_offset)) / size.height) 
        };
    }



    /**
     * @name sort_anchors
     * Sorts the anchors by x position
     * used for rendering the line correctly
     * 
     * @returns {void} Nothing
     */
    public sort_anchors(
    ): void {
        // -- Sort the anchors
        this._anchors.sort((a, b) => {
            const a_pos = a.shape.position(),
                b_pos = b.shape.position();
            if (a_pos.x < b_pos.x) return -1;
            if (a_pos.x > b_pos.x) return 1;
            return 0;
        });

        // -- If this is a Y line, disable the handles
        //    for the first and last anchor
        if (!this._config.is_y_line) return;

        // -- Disable the handles
        this._anchors.forEach((anchor, index) => {
            if (index === 0 || index === this._anchors.length - 1) {
                anchor.handle.visible(false);
                anchor.handle.draggable(false);
            }

            else {
                anchor.handle.draggable(true); 
                anchor.handle.visible(true);
            }
        });

    };



    /**
     * @name serialize
     * Serializes the instance state into JSON format
     * @returns {string} The serialized JSON representation of the instance state
     */
    public serialize(
    ): string {
        const serialized_state = {
            config: this._config,
            anchors: this._anchors.map(anchor => (
                this.get_anchor_percent(anchor)
            ))
        };

        // -- Return the serialized state
        return JSON.stringify(serialized_state);
    }



    /**
     * @name parse_serialized_data
     * Parses the serialized JSON data and handles errors
     * 
     * @param {string} serialized_data - The serialized JSON representation of the instance state
     * 
     * @returns {unknown} The parsed data
     */
    private static parse_serialized_data(
        serialized_data: string
    ): unknown {

        // -- Try to parse the data
        try {
            log('INFO', 'Attempting to parse the serialized data');
            const data = JSON.parse(serialized_data);
            log('INFO', 'Parsed the serialized data');
            return data;
        } 
        
        // -- Catch the error
        catch (e) {
            log('ERROR', 'Unable to parse the serialized data');
            throw new Error('Unable to parse the serialized data');
        }
    }



    /**
     * @name validate_serialized_data
     * Validates the parsed data for correct format
     * 
     * @param {unknown} data - The parsed data to validate
     * 
     * @returns {boolean} Whether the data is valid or not
     */
    private static validate_serialized_data(
        data: unknown
    ): boolean {
        return (
            typeof data === 'object' &&
            Object.keys(data).includes('config') &&
            Object.keys(data).includes('anchors') &&
            typeof data['config'] === 'object' &&
            Array.isArray(data['anchors'])
        );
    }



    /**
     * @name deserialize
     * Deserializes JSON into an instance of the class
     * @param {string} serialized_data - The serialized JSON representation of the instance state
     * @param {konva.Layer} layer - The Konva layer to add the deserialized line to
     * @returns {Line} The deserialized instance of the Line class
     */
    public static deserialize(
        serialized_data: string, 
        layer: konva.Layer
    ): Line {
        
        // -- Parse the serialized data
        const data = Line.parse_serialized_data(serialized_data);
        if (!Line.validate_serialized_data(data)) {
            log('ERROR', 'The serialized data is not valid');
            throw new Error('The serialized data is not valid');
        }

        // -- Get the data
        const config = data['config'] as LineConfiguration,
            anchors = data['anchors'] as Array<{ x: number, y: number }>;

        // -- Create the line
        const deserialized_line = new Line(layer, config, false);

        // -- Add the anchors
        anchors.forEach((anchor_data: unknown) => {
            // -- Check if the anchor data is valid
            if (typeof anchor_data !== 'object') return;
            if (
                Object.keys(anchor_data).indexOf('x') === -1 ||
                Object.keys(anchor_data).indexOf('y') === -1 ||
                typeof anchor_data['x'] !== 'number' ||
                typeof anchor_data['y'] !== 'number'
            ) return;

            // -- Clamp the values
            const x = Math.max(0, Math.min(1, anchor_data['x']));
            const y = Math.max(0, Math.min(1, anchor_data['y']));  

            // -- Create the anchor
            deserialized_line.add_anchor(x, y);
        });

        // -- Sort the anchors
        deserialized_line.sort_anchors();

        // -- Return the deserialized line
        return deserialized_line;
    }



    //                                 //
    // ------ Getters / Setters ------ //
    //                                 //



    /**
     * @name width
     * @description Gets the width of the line
     * @returns {number} The width of the line
     */
    public get width(): number { 
        return this._config.size.width; }

    public set width(value: number) {
        this._config.size.width = value;
        this._bounding_box.width(value);
    }



    /**
     * @name height
     * @description Gets the height of the line
     * @returns {number} The height of the line
     */
    public get height(): number {
        return this._config.size.height; }

    public set height(value: number) {
        this._config.size.height = value;
        this._bounding_box.height(value);
    }



    /**
     * @name anchors
     * @description Gets the anchors of the line
     * @returns {Anchor[]} The anchors of the line
     */
    public get anchors(): Anchor[] { 
        return this._anchors; }


    
    /**
     * @name config
     * @description Gets the config of the line
     * @returns {LineConfiguration} The config of the line
     */
    public get config(): LineConfiguration {
        return this._config; }



    /**
     * @name position
     * @description Gets the position of the line
     * @returns {{x: number, y: number}} The position of the line
     */
    public get position(): { x: number, y: number } {
        return this._position; }


    
    //                                //
    // ------ Static Functions ------ //
    //                                //



    /**
     * @name _remove_anchor_listener
     * This function makes sure that the corect
     * tool is selected that allows the user to
     * remove anchors
     * 
     * @returns {void} Nothing
     */
    private _remove_anchor_listener(
    ): void {
        // -- Helper function to determine if the remove tool is active
        let active = get_active_tool()?.tool === 'anchor-remove';
        append_listener((tool: ToolObject) => {
            if (!tool) active = false;
            else active = tool.tool === 'anchor-remove';
        });

        // -- Mouse down listener
        this._layer.on('mousedown', (e) => {
            // -- Make sure that the tool is active
            if (!active) return;

            // -- Remove the anchor
            this._remove_anchor();
        });
    }



    /**
     * @name _remove_anchor
     * Finds the closest anchor to the mouse
     * and removes it 
     * 
     * @returns {void} Nothing
     */
    private _remove_anchor(
    ): void {
        // -- Get the mouse position
        const mouse_pos = this._layer.getStage().getPointerPosition();

        // -- Get all the anchor positions
        const positions = this._anchors.map(anchor => {
            const handle_pos = anchor.handle.position(),
                handle_size = anchor.handle.size();

            return {
                top: handle_pos.y,
                bottom: handle_pos.y + handle_size.height,
                left: handle_pos.x,
                right: handle_pos.x + handle_size.width,
            }
        });

        // -- Find the closest anchor
        let closest_anchor = null;
        positions.forEach((position, index) => {
            // -- If the closest anchor is set, return
            //    as we already found the closest anchor
            if (closest_anchor) return;

            // -- CHeck if the mouse is within the bounds
            if (
                mouse_pos.x < position.left ||
                mouse_pos.x > position.right ||
                mouse_pos.y < position.top ||
                mouse_pos.y > position.bottom
            ) return;
            
            // -- Set the closest anchor
            closest_anchor = this._anchors[index];
        });


        // -- Check if the closest anchor is within the bounds
        const anchor_index = this._anchors.indexOf(closest_anchor);
        if (anchor_index === -1) return;

        // -- if this is a Y line, make sure that the anchor
        //    is not the first or last anchor
        if (
            this._config.is_y_line &&
            (anchor_index === 0 || anchor_index === this._anchors.length - 1)
        ) return log('WARN', 'Unable to remove the first or last anchor of a Y line');


        // -- Remove the anchor
        log('INFO', `Removing anchor at index ${anchor_index}`);
        this._anchors[anchor_index].shape.destroy();
        this._anchors[anchor_index].handle.destroy();
        this._anchors[anchor_index].line.destroy();
        this._anchors.splice(anchor_index, 1);
        this.sort_anchors();
        render_line(this);
    }



    /**
     * @name _ghost_anchor_listener
     * Creates a ghost anchor that is used for 
     * the 'Anchor-add' tool to show where the
     * anchor will be placed
     * 
     * @returns {void} Nothing
     */
    public _ghost_anchor_listener(
    ): void {

        // -- Helper function to determine if the add tool is active
        let active = get_active_tool()?.tool === 'anchor-add';
        let in_bounds = false;
        append_listener((tool: ToolObject) => {
            if (!tool) active = false;
            else active = tool.tool === 'anchor-add';
            if (!active) in_bounds = false;
            state();
        });




        // -- Helper function to automatically set the ghost anchors
        //    visibility / state
        const state = (
            current_state: boolean = active && in_bounds
        ) => {
            // -- If the tool is active, show the ghost anchor
            if (current_state) {
                this._ghost_anchor.anchor.show();
                this._ghost_anchor.line.show();
                return;
            }

            // -- Hide the ghost anchor
            this._ghost_anchor.anchor.hide();
            this._ghost_anchor.line.hide();
        };



        const update_ghost_anchor = (
            e: KonvaEventObject<any> 
        ) => {
            // -- make sure that the tool is active
            if (!active) return;


            // -- Calculate the line start and end
            const line_start = {
                x: this.position.x,
                y: this.position.y - this.config.y_offset,
            };

            const line_end = {
                x: line_start.x + this.config.size.width,
                y: line_start.y + this.config.size.height,
            };

            // -- Get the mouse position
            const mouse_pos = e.target.getStage().getPointerPosition();


            // -- Check if the mouse is within the bounds
            if (
                mouse_pos.x < line_start.x ||
                mouse_pos.x > line_end.x ||
                mouse_pos.y < line_start.y ||
                mouse_pos.y > line_end.y
            ) return state(in_bounds = false);
            state(in_bounds = true);



            // -- Set the ghost anchor position
            this._ghost_anchor.anchor.position({
                x: mouse_pos.x - this._ghost_anchor.anchor.width() / 2,
                y: this._config.achor_position === 'bottom' ? 
                    line_start.y + this._config.cutting_depth + this._config.handle_padding :
                    line_start.y - this._ghost_anchor.anchor.height() - this._config.handle_padding,
            });


            // -- Calculate the anchor center
            const anchor = this._ghost_anchor.anchor.position(),
                anchor_center = {
                x: anchor.x + this._ghost_anchor.anchor.width() / 2,
                y: anchor.y + this._ghost_anchor.anchor.height() / 2,
            };


            // -- Set the ghost anchor line points
            this._ghost_anchor.line.points([
                anchor_center.x, anchor_center.y,
                anchor_center.x, this._config.achor_position === 'bottom' ?
                    line_start.y - this._config.handle_padding : 
                    line_end.y + this._config.handle_padding,
            ]);
        };



        const add_anchor = (
            e: KonvaEventObject<any>
        ) => {
            // -- Make sure that we can add an anchor
            if (!active || !in_bounds) return;

            // -- Calculate the x position of the anchor
            const mouse_pos = e.target.getStage().getPointerPosition(),
                x_percent = Math.abs((mouse_pos.x - this.position.x) / this.width);

            // -- Add the anchor
            const anchor = this.add_anchor(x_percent);
            Line._set_anchor_to_mouse(this, anchor, e);
            this.sort_anchors();
        }



        // -- Add the listener
        this._layer.on('mousemove', (e) => update_ghost_anchor(e));
        this._layer.on('mousedown', (e) => add_anchor(e));
        state(false);
    }

    

    /**
     * @name _anchor_listener
     * Handles the listener for the anchor of a line
     * allowing it to move up and down
     * 
     * @param {Line} line - The line that the anchor is on
     * @param {Anchor} anchor - The anchor to add the listener to
     * 
     * @returns {void} Nothing
     */
    private static _anchor_listener(
        line: Line,
        anchor: Anchor
    ): void {
        // -- Add the listener
        anchor.shape.on('dragmove', (e) => 
            this._set_anchor_to_mouse(line, anchor, e));

        // -- Render the line
        render_line(line);
    };



    /**
     * @name _set_anchor_to_mouse
     * This function sets the anchor to the mouse position
     * ITs separated from the _anchor_listener function
     * as this is reusable code that is used for the 
     * 'Anchor-add' tool
     * 
     * @param {Line} line - The line that the anchor is on
     * @param {Anchor} anchor - The anchor to add the listener to
     * @param {KonvaEventObject<any>} e - The event object
     * 
     * @returns {void} Nothing
     */
    public static _set_anchor_to_mouse(
        line: Line,
        anchor: Anchor,
        e: KonvaEventObject<any>
    ): void {
        // -- Check if the user is holding 'ctrl'
        const free_move = e.evt.ctrlKey;

        // -- Get the anchor position
        let { x, y } = anchor.shape.position();


        // -- Make sure that the anchor is within the line
        const min_y = anchor.min_y,
            max_y = anchor.max_y;


        // -- Get the anchors X position from the handle
        const handle_pos = anchor.handle.position(),
            handle_size = anchor.handle.size(),
            const_x = handle_pos.x + handle_size.width / 2;

            
        // -- Set the anchor position
        const width = anchor.shape.width(),
            height = anchor.shape.height();


        // -- Set the anchor position
        anchor.shape.position({
            x: const_x - width / 2,
            y: Math.max(
                min_y - height / 2, 
                Math.min(max_y - height / 2, y)
            )
        });

        // -- Render the line
        anchor.position = line.get_anchor_percent(anchor);
        render_line(line);
    }



    /**
     * @name _handle_listener
     * Handles the listener for the handle of an anchor
     * allowing it to move left and right
     * 
     * @param {Line} line - The line that the anchor is on
     * @param {Anchor} anchor - The anchor itself
     * 
     * @returns {void} Nothing
     */
    private static _handle_listener(
        line: Line, 
        anchor: Anchor
    ): void {
        anchor.handle.on('dragmove', () => {
            // -- Get the handle position
            const [width, height] = get_client_size(),
                { x, y } = anchor.handle.position();

            const x_offset = (width / 2 - line.width / 2) - (anchor.handle.width() / 2),
                min_x = x_offset,
                max_x = x_offset + line.width,
                new_x = Math.max(min_x, Math.min(max_x, x));

            // -- Set the handle position
            anchor.handle.position({
                x: new_x,
                y: line._config.achor_position === 'bottom' ? 
                    anchor.handle_y : anchor.handle_neg_y,
            });
            
            // -- Move the anchor
            anchor.shape.position({
                x: new_x - (anchor.shape.width() / 2) + (anchor.handle.width() / 2),
                y: anchor.shape.position().y ,
            });

            // -- Render the line
            anchor.position = line.get_anchor_percent(anchor);
            render_line(line);
        });
    };




    /**
     * @name _resize_listener
     * Handles the resize events for the line making
     * sure that the line is always centered and that 
     * nothing is out of bounds
     * 
     * @param {Line} line - The line to add the listener to
     * @param {number} wait - The time to wait before executing the function
     * 
     * @returns {void} Nothing
     */
    public static _resize_listener(
        line: Line,
        wait: number = 100
    ): void {   

        // -- This is a way to reduce the amount of resize events
        //    that we have to process, it will wait for the user
        //    to stop resizing the window before executing the function
        let resize_timeout;
        window.addEventListener('resize', () => {
            if (resize_timeout) clearTimeout(resize_timeout);
            resize_timeout = setTimeout(() => resize(), wait);
        });


        // -- Function responsible for resizing the line
        //    and all of it's elements
        const resize = () => {
            // -- Get the new size
            const [width, height] = get_client_size();

            // -- Get the bounding box position
            const bounding_box_size = line._bounding_box.size();

            // -- Get the offset
            const offset_left = width / 2 - bounding_box_size.width / 2,
                offset_top = height / 2 - bounding_box_size.height / 2;

            // -- Set the position
            line._bounding_box.position({
                x: offset_left,
                y: offset_top,
            });

            // -- Set the position
            line._position = line._bounding_box.position();


            // -- Set the handle position
            line._anchors.forEach(anchor => {
                // -- Offset the y position
                const y = line.position.y - line.config.y_offset;

                // -- Set the bounds
                anchor.max_y = y + line.config.cutting_depth;
                anchor.min_y = y;
                anchor.handle_y = y + line.config.cutting_depth + line.config.handle_padding;
                anchor.handle_neg_y = y - line.config.handle_padding - anchor.handle.height();
        
                    

                // -- Get the anchor position
                const pos = line._calculate_anchor_position(
                    anchor.position.x,
                    anchor.position.y
                );


                // -- Set the anchor position
                anchor.handle.position({
                    x: pos.x - anchor.handle.width() / 2,
                    y: line.config.achor_position === 'bottom' ? 
                        anchor.handle_y : anchor.handle_neg_y
                });


                // -- Set the anchor position
                anchor.shape.position({
                    x: pos.x - anchor.shape.width() / 2,
                    y: pos.y - anchor.shape.height() / 2,
                }); 
            });

            // -- Render the line
            render_line(line);
        };
    }
}