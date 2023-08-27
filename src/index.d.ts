import Point from './point';
import konva from 'konva';

export type Points = Array<Point>;

export type Line = {
    width: number,
    height: number,
    cutting_depth: number,
    depth_line: konva.Line,
    depth_buffer: number,
    line: konva.Line,
    y_line: boolean,
    path: konva.Path,
    points: Points,
    anchor: konva.Shape,
    anchors: Array<Anchor>,
    anchor_handle: konva.Shape,
    handle_padding: number,
    spread: number,
    bounding_box: konva.Rect,
    def_points: Array<number>,
    y_offset: number,
    snap_range: number,
    raw_path: string,
    get_layer: () => konva.Layer,
    get_index: () => number,
    add_anchor: (x: number | void, y: number | void) => Anchor,
}

export type Anchor = {
    shape: konva.Shape,
    line: konva.Line,
    handle: konva.Shape,
    max_y: number,
    min_y: number,
    handle_y: number,
    handle_neg_y: number,
    position: { x: number, y: number }
}

export type Lines = Array<Line>;

export type Tool = {
    name: string,
    angle_of_attack: number,
    width: number,
    depth: number,
}

export type CnC = {
    name: string,

    // -- Cnc dimensions
    width: number,
    height: number,
    depth: number,

    material_center: Point,
}


export interface LineConfiguration { 
    colors: Colors;
    size: {
        width: number,
        height: number,
    };
    cutting_depth: number;
    is_y_line: boolean;
    y_offset: number;
    anchor_spread: number;
    handle_padding: number;
    depth_buffer: number;
    achor_position: 'top' | 'bottom';
}

export interface Colors {
    line: {
        stroke: string,
        fill: string,
    };
    
    path: {
        stroke: string,
        fill: string,
    };

    anchor: {
        stroke: string,
        fill: string,
    };

    anchor_handle: {
        stroke: string,
        fill: string,
    };

    anchor_guide: {
        stroke: string,
        fill: string,
    };

    depth_line: {
        stroke: string,
        fill: string,
    };

    bounding_box: {
        stroke: string,
        fill: string,
    };
}



export interface File {
    name: string;
    x_line: string;
    y_line: string;
    last_modified: number;
    created: number;
}