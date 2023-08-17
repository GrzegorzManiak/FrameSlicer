import konva, {} from 'konva';
import { Anchor, Colors, LineConfiguration } from './index.d';
import { render_line } from './render';
import { get_client_size } from './aux';

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

    public constructor(
        layer: konva.Layer,
        config: LineConfiguration,
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



        // -- Add the elements
        layer.add(this._line);
        layer.add(this._path);
        layer.add(this._bounding_box);
        layer.add(this._depth_line);


        // -- Hide the depth line if it's a y line
        if (config.is_y_line) 
            this._depth_line.hide();


        // -- Set the variables
        this._layer = layer;
        this._config = config;
        this._colors = config.colors;
        this._raw_path = '';


        // -- Initialize the anchors
        this._anchors = [];
        this._init_anchors();
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
            this.add_anchor(
                offset_left + anchor_ammount * i,
                offset_top - this._config.y_offset,
            )
        }
    }



    /**
     * @name add_anchor
     * Adds an anchor to the line
     * 
     * @param {number} x The x position of the anchor
     * @param {number} y The y position of the anchor
     * 
     * @returns {void} Nothing
     */
    public add_anchor( 
        x: number, 
        y: number
    ): void {
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
    };



    /**
     * @name sort_anchors
     * Sorts the anchors by x position
     * used for rendering the line correctly
     * 
     * @returns {void} Nothing
     */
    public sort_anchors(
    ) {
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


    
    //                                //
    // ------ Static Functions ------ //
    //                                //

    

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
        // -- Set the variables
        let last_mouse_pos = { x: 0, y: 0 },
            snapped = false,
            snapped_at = 0;
        
        anchor.shape.on('dragmove', (e) => {
            // -- Check if the user is holding 'ctrl'
            const free_move = e.evt.ctrlKey;

            // -- Get the anchor position
            let { x, y } = anchor.shape.position();

            // -- Make sure that the anchor is within the line
            const max_y = anchor.max_y,
                min_y = anchor.min_y;

            // -- Get the cnst X from the handle
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
            last_mouse_pos = { x: e.evt.clientX, y: e.evt.clientY };
            render_line(line);
        });

        // -- Render the line
        render_line(line);
    };



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
        anchor: Anchor) 
    {
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
            render_line(line);
        });
    };
}