import Game from "../Game.js";
import Entity from "./Entity.js";
import Player from "./Player.js";

// this class will only be used as a type in and perant class
/** @abstract*/
export class Fruit extends Entity {
    
    static isInitialized = false;
    origin = {x: 0, y: 0};
    /**
     * @param {Game} game 
     * @param {number} x
     * @param {number} y
     */
    constructor(game, x, y){
        super(game);
        this.origin.x = x;
        this.origin.y = y;
        this.moveX = 0;
        this.moveY = 0;
        this.velocityX = 3
    }

    /**
     * @param {Game} game 
     * @returns {void}
     */
    static initializeImages(game, name = null){
        if(this.imagesPath !== undefined) this.images = game.getImages(this.imagesPath + "/" + (name ?? this.name));
        this.isInitialized = true;
    }

    /**
     * @param {number} deltatime 
     * @param {Player} player 
     */
    update(deltatime, player){
        super.animate(deltatime);
        // console.a(this.velocityX, "dawdaw")
        this.moveX += 0.05 + Math.random() / 10;
        this.moveY += 0.3 + Math.random() / 15;
        this.hitbox.setX(this.origin.x + Math.cos(this.moveX) * 13 + Math.random() + this.velocityX);
        this.hitbox.setY(this.origin.y + Math.sin(this.moveY) * 10 + Math.random() + this.velocityY);
        // this.hitbox.setX(this.hitbox.getX() + this.velocityX )
        // this.origin.x += this.velocityX;
        
        // this.y = this.origin.y + Math.sin(this.moveY) * 9 + Math.random();
        // this.hitbox.setXWithOffset()
        // this.hitbox.setYWithOffset()
        if(this.hitbox.isColliding(player.getHitbox())){ this.isMarkedForDeletion = true; }
    }
}

export class Apple extends Fruit {
    static images
    static get imagesPath() { return "Items/Fruit"; }
    /**
     * @param {Game} game
     * @param {number} x  
     * @param {number} y  
     */
    constructor(game, x ,y) {
        super(game, x, y);
        if(!this.constructor.isInitialized) { this.constructor.initializeImages(game); }
        this.images = Apple.images;
        this.image = this.images[this.currentImageIndex];
        this.initializeHitbox(x, y, this.image.width, this.image.height, 16, 13);
        super.frameInterval = 1000 / (Math.ceil(Math.random() * 25) + 15);
        // console.a(this.frameInterval)
    }

    /**
     * @param {number} deltatime 
     * @param {Player} player 
     */
    update(deltatime, player){
        super.update(deltatime, player);
        // console.a(this.hitbox.getX(), this.hitbox.getY())
        // this.frameInterval -= Math.ceil(Math.random() * 30) + 20;
    }
}