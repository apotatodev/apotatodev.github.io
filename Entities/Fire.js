import Entity from "./Entity.js";

export default class Fire extends Entity {
    static images
    static get imagesPath() { return "Traps/Fire"; }

    /**
     * @param {Game} game
     * @param {number} x  
     * @param {number} y  
     */
    constructor(game, x ,y) {
        super(game, x, y);
    }
}