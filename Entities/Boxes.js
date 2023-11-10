import Game from "../Game.js";
import Entity from "./Entity.js";

// this class will only be used as a type in and perant class
/** @abstract */
export class Box extends Entity {

    static #ImagesPath = "Items/Boxes";
    /**
     * @param {Game} game 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(game){
        super(game);
        this.imageMap = game.getImages(Box.#ImagesPath + `/${this.constructor.name}`);
        this.images = this.imageMap.get("Idle");
        this.image = this.images[this.currentImageIndex];
    }
}

export class Box1 extends Box {
    
    /**
     * @param {Game} game 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(game, x, y){
        super(game);
        this.initializeHitbox(x, y, this.image.width + 20, this.image.height + 20, 10, 10);

    }

    update(deltatime, ){
        this.velocityY += this.gravity;
        this.hitbox
    }
}