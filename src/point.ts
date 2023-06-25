import konva from 'konva';

export default class Point {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }



    /**
     * @name x
     * @description The x coordinate of the point
     * @returns {number} The x coordinate of the point
     */
    get x(): number {
        return this._x;
    }



    /**
     * @name y
     * @description The y coordinate of the point
     * @returns {number} The y coordinate of the point
     */
    get y(): number {
        return this._y;
    }



    /**
     * @name get_dist
     * @param point The point to compare to
     * @returns {number} The distance between this point and the given point
     */
    public get_dist(this, point: Point): number {
        const x_dist = Math.abs(this.x - point.x),
            y_dist = Math.abs(this.y - point.y);
        return Math.sqrt(Math.pow(x_dist, 2) + Math.pow(y_dist, 2));
    }

}