import Game from "../Game.js";
// import { States } from "../utils/PlayerStates.js";
import Hitbox from "../utils/Htibox.js";
import Constants from "../utils/Constants.js";
import { Implementer } from "../utils/UtilityHandlers.js";

/** @abstract*/
export default class Entity {
    /**
     * @description
     * 
     * NOTE: !___DON'T USE THIS___!
     * 
     * this is pretty much muctiply inheritance,
     * but should only be used for implementing methods
     * @param {any[]} EntityArguments 
     * @param {string[]} ClassesToimplements 
     * @returns {Entity}
     */
    createNewInstance(EntityArguments, ClassesToimplements){
        return ClassesToimplements.reduce((totalImplements, implement) => {
            return {__proto__: totalImplements, ...(new Implementer[implement]())};
        }, {__proto__: new this.constructor(...EntityArguments)});
    }
    game;

    // animation stuff
    images = null;
    image = null;// to be set by child class
    frameTimer = 0;
    fps = 20;
    frameInterval = 1000 / this.fps // default frames per-second
    currentImageIndex = 0;
    maxFrame = 0; // to be set by child class
    imageIsFlippedHorizontally = false;
    imageIsFlippedVertically = false;

    // movement stuff
    gravity = 0.55 * SCALE_UP;
    maxFallingSpeed = 8.7 * SCALE_UP;
    isOnGround = false;
    velocityX = 0;
    velocityY = 0;

    //
    hitbox = null;// to be set by child class
    #states = null;// to be set by child class
    isMarkedForDeletion = false;

    tj = class {}
    
    /**
     * @param {Game} game 
     */
    constructor(game){
        // todo: have fruits and enemy extend Entity
        this.game = game;
    }

    /**
     * @param {number} deltatime 
     */
    animate(deltatime){
        this.frameTimer += deltatime;
        // console.log(this.frameInterval, this.frameTimer, deltatime, this.currentImageIndex, this.constructor.name)
        if(this.frameTimer >= this.frameInterval){
            this.frameTimer = 0;
            if(this.currentImageIndex >= this.images.length) {
                this.currentImageIndex = 0;
                this.image = this.images[this.currentImageIndex];
            }
            else {
                this.image = this.images[this.currentImageIndex];
                this.currentImageIndex++;
            }
        }
    }

    /**
     * @param {number} vector 
     * @returns {void}
     */
    applyToVelocityX(vector){ this.velocityX += vector; }

    /**
     * @param {number} vector 
     * @returns {void}
     */
    applyToVelocityY(vector){ this.velocityY += vector; }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {number} offsetX 
     * @param {number} offsetY 
     */
    draw(context, offsetX, offsetY){
        context.save();
        context.imageSmoothingQuality = "high";
        context.imageSmoothingEnabled = false;

        //initialize image size
        const   sourceWidth = this.constructor.imageWidth ?? this.image.width,
                sourceHeight = this.constructor.imageHeight ?? this.image.height,
                drawWidth = this.width ?? sourceWidth * SCALE_UP,
                drawHeight = this.height ?? sourceHeight * SCALE_UP;

        // handle image flipping
        let scaleX = 1, scaleY = 1, translateX = 1, translateY = 1;
        if(this.imageIsFlippedHorizontally){
            scaleX = -1;
            translateX = -((drawWidth / 2 + this.hitbox.getXWithOffset()) * 2);
            offsetX = -offsetX;
        }// else draw image with normal horizontal image direction

        if(this.imageIsFlippedVertically){
            scaleY = -1;
            translateY = -((drawHeight / 2 + this.hitbox.getYWithOffset()) * 2);
            offsetY = -offsetY;
        }//else draw image with normal vertical image direction
        context.scale(scaleX, scaleY);
        context.translate(translateX, translateY);

        //draw image with correct oriantation
        context.drawImage(
            this.image,
            0,
            0,
            sourceWidth,
            sourceHeight,
            this.hitbox.getXWithOffset() - offsetX, // apply window scrolling
            this.hitbox.getYWithOffset() - offsetY, // apply window scrolling
            drawWidth,
            drawHeight
        );
        // console.a(sourceWidth, sourceHeight, this.hitbox.getXWithOffset() - offsetX, this.hitbox.getYWithOffset() - offsetY, drawWidth, drawHeight, this.image.width, this.image.height, "entitiy");

        // draw hitbox when debug is active
        if(this.game.getDebug())
            context.strokeRect(this.hitbox.getX() - offsetX, this.hitbox.getY() - offsetY, this.hitbox.getWidth(), this.hitbox.getHeight());
        context.restore();
    }

    // stateManager(){
    //     // this.currentState.handleInput()
    //     const result = this.states.get(this.currentState)();
    //     if(result === null) { return; }
    //     this.enterState()
    // }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {number} offsetX 
     * @param {number} offsetY 
     * @returns {void}
     */
    initializeHitbox(x, y, width, height, offsetX = 0, offsetY = 0){ this.hitbox ??= new Hitbox(x, y, width, height, offsetX, offsetY); }

    // /**
    //  * @param {States[][]} states
    //  * @returns {void}
    //  */
    // initializeStates(states){ this.#states ??= new Map(states); }

    /**
     * @returns {Hitbox | null}
     */
    getHitbox(){return this.hitbox}

    /**
     * @returns {boolean}
     */
    getIsMarkedForDeletion(){ return this.isMarkedForDeletion; }

    /**
     * @returns {number}
     */
    getVelocityX(){ return this.velocityX; }
    
    /**
     * @returns {number}
     */
    getVelocityY(){ return this.velocityY; }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height
     * @returns {boolean}
     */
    isColliding(x, y, width, height) {
    
        // true if hitbox was initialized and rectangles dont overlap
        return this.hitbox && (
            this.hitbox.getX() + this.hitbox.getWidth() > x &&
            x + width > this.hitbox.getX() + this.velocityX &&
            this.hitbox.getY() + this.hitbox.getHeight() > y &&
            y + height > this.hitbox.getY()
        );
    }

    /**
     * @param {boolean} isMarkedForDeletion 
     * @returns {void}
     */
    setIsMarkedForDeletion(isMarkedForDeletion){ this.isMarkedForDeletion = isMarkedForDeletion; }

    /**
     * @returns {void}
     */
    updateEntitieGrid(){
        const entityGrid = this.game.getLevelManager().getEntitiesGrid(), tileSize = this.game.getLevelManager().getTileSize();

        if(!this.hitbox) { return; }
        const uniqueGridPositions = new Set([
            [Math.floor(this.hitbox.getX() / tileSize), Math.floor(this.hitbox.getY() / tileSize)],
            [Math.floor(this.hitbox.getXWithWidth() / tileSize), Math.floor(this.hitbox.getY() / tileSize)],
            [Math.floor(this.hitbox.getX() / tileSize), Math.floor(this.hitbox.getYWithHeight() / tileSize)],
            [Math.floor(this.hitbox.getXWithWidth() / tileSize), Math.floor(this.hitbox.getYWithHeight() / tileSize)],
        ]);
        for(const [x, y] of uniqueGridPositions) { entityGrid[y][x].push(entity); }
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {void}
     */
    updateHitbox(x, y) {
        this.hitbox.setX(x);
        this.hitbox.setY(y);
    }
}