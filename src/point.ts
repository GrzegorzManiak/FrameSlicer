import konva from 'konva';

export default class Point {
    private _x: number;
    private _y: number;
    private _z: number;

    private _comment: string = '';

    constructor(x: number, y: number, z: number = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    

    /**
     * @name comment
     * @description The comment for the point
     * @returns {string} The comment for the point
     */
    get comment(): string {
        return this._comment;
    }



    /**
     * @name comment
     * @description Set the comment for the point
     * @param {string} comment - The comment for the point
     */
    set comment(comment: string) {
        this._comment = comment;
    }



    /**
     * @name has_comment
     * @description Check if the point has a comment
     * @returns {boolean} True if the point has a comment, false otherwise
     */
    get has_comment(): boolean {
        return this._comment.length > 0;
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
     * @name z
     * @description The z coordinate of the point
     * @returns {number} The z coordinate of the point
     */
    get z(): number {
        return this._z;
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