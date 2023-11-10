import Entity from "./Entity.js";

export default class FireBall extends Entity {

    /**
    * @param {Game} game 
    * @param {number} x 
    * @param {number} y 
    * @returns {Entity}
    */
    constructor(game, x, y){
        super(game, x ,y);
        // this.images = 
        this.initializeHitbox(x, y, this.image.width, this.image.height);
    }
}