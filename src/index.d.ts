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
    path: konva.Path,
    points: Points,
    anchor: konva.Shape,
    anchors: Array<Anchor>,
    anchor_handle: konva.Shape,
    handle_padding: number,
    spread: number,
    bounding_box: konva.Rect,
    def_points: Array<number>,
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