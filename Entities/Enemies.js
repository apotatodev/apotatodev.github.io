import Game from "../Game.js";
import Entity from "./Entity.js";
import Constants from "../utils/Constants.js";
import Player from "./Player.js";

//this will only be used as a type and perant class
/** @abstract*/
export class Enemy extends Entity {


    EnemyStates = class {
        static tt = class {
            pp(){

            }
        }
        constructor(){

        }

        static Idle = class extends this.tt{
            constructor(animationRevolutions = 1){
                // this.constructor.__proto__.
            }
        }
    }

    static get imagesPath() { return "Enemies"; }
    static imageMap;
    static isInitialized = false;
    /**
     * @param {Game} game 
     * @returns {void}
     */
    static initializeImageMap(game, name = null){
        this.imageMap = game.getImages(this.imagesPath + "/" + (name ?? this.name));
        this.isInitialized = true;
    }

    //
    static #maxFallingSpeed = 8.7 * Constants.World.scaleUpTile;
    static #friction = 0.5 / Constants.World.scaleUpTile
    
    //
    #health = 100;
    maxSpeed = 1 * Constants.World.scaleUpTile;
    canSeePlayer = false;
    /**
     * @param {Game} game
     */
    constructor(game){
        super(game);

    }

    draw(context, offsetX, offsetY){
        super.draw(context, offsetX, offsetY);
        // console.log("dawdwa drawn?")
    }

    /**
     * @param {number} deltatime 
     * @returns {void}
     */
    update(deltatime){
        super.animate(deltatime);
        if(Math.abs(this.velocityX) > this.maxSpeed) { this.velocityX *= Enemy.#friction; }
        if(!this.isOnGround && this.velocityY < Enemy.#maxFallingSpeed) this.velocityY += this.gravity;
        this.hitbox.addX(this.velocityX);
        this.hitbox.addY(this.velocityY);
    }

    /**
     * @param {"bottom" | "top" | "right" | "left"} collidingSide 
     * @param {number} damage 
     * @returns {void}
     */
    handleHit(collidingSide, damage){
        this.handleHealthChange(damage);
        this.setAnimation("Hit");

        switch (collidingSide) {
            case "bottom":
                this.setAnimation("Hit");
                break;
            case "left":

                break
            case "right":

                break
            case "top":
                break
            default:
                break;
        }
    }

    /**
     * @param {number} modifier
     * @returns {void}
     */
    handleHealthChange(modifier){
        this.#health -= modifier;
        if(this.health <= 0){ this.isMarkedForDeletion = true; }
        // if(modifier < 0){ this.setAnimation("Hit"); }
    }

    /**
     * @param {string} state
     */
    setAnimation(state){
        this.currentImageIndex = 0;
        this.frameTimer = 0;
        this.images = this.imageMap.get(state);
        this.image = this.images[this.currentImageIndex];
        this.frameInterval = (this.stateToAnimationIntervals.get(state) ?? this.frameInterval);
    }

}

export class Mushroom extends Enemy {
    // static imageWidth = 0;
    // static imageHeight = 0;

    /**
     * @param {Game} game 
     * @param {number} x 
     * @param {number} y
     */
    constructor(game, x, y){
        super(game);
        if(!this.constructor.isInitialized) { this.constructor.initializeImageMap(game); }
        this.imageMap = this.constructor.imageMap;
        console.log(this.imageMap)
        this.images = this.imageMap.get("Idle");
        this.image = this.images[this.currentImageIndex];
        this.initializeHitbox(x, y, this.image.width * Constants.World.scaleUpTile - 10, this.image.height * Constants.World.scaleUpTile - 23, 6, 23);
        this.lastPos = {x: this.hitbox.getX(), y: this.hitbox.getY()};
        this.lastFrame = this.currentImageIndex;
        this.velocityX = (Math.random() > 0.5) ? (this.maxSpeed) : (-this.maxSpeed);
        this.frameCount = 0;
        this.neededFrames = 0;
        this.justFlipped = false;
        // this.imageIsFlippedHorizontally = true
        this.stateToAnimationIntervals = new Map([
            ["Idle", 50],
            ["Run", 50],
            ["Hit", 25]
        ]);
    }

    /**
     * @param {Player} player 
     * @param {number[][]} grid 
     * @returns {void}
     */
    checkPlayerIsinVisibilityRange(player, grid){
        // if(this.canSeePlayer){ return; }
        this.canSeePlayer = false;
        // if(Math.abs(this.velocityX) > this.maxSpeed) { this.velocityX /= 2; }
        const hitbox = player.getHitbox();
        if(hitbox.getY() <= this.hitbox.getY() + this.hitbox.getHeight() && this.hitbox.getY() <= hitbox.getY() + hitbox.getHeight()){
            if((hitbox.getX() < this.hitbox.getX() && this.imageIsFlippedHorizontally) || (hitbox.getX() > this.hitbox.getX() && !this.imageIsFlippedHorizontally)){
                const   tileSize = this.game.getLevelManager().getTileSize(),
                        searchX = Math.min(this.hitbox.getCenterX(), hitbox.getCenterX()),
                        searchY = Math.floor(this.hitbox.getCenterY() / tileSize);
                for(let i = Math.floor(searchX / tileSize); i < grid[searchY].length; i++){
                    if(grid[searchY]?.[searchX] === Constants.Terrain.collisionBlock){ return; }
                }
                this.velocityX = (hitbox.getX() > this.hitbox.getX()) ? this.maxSpeed * 2 : -this.maxSpeed * 2;
                this.setAnimation("Run");
                this.canSeePlayer = true;
            }
        }
    }

    /**
     * @param {Player} player 
     * @returns {void}
     */
    handlePlayerCollision(player){
        if( this.hitbox.isColliding(player.getHitbox())  ) {
                // player.applyToVelocityX("hit", this.hitbox.getX() > player.getHitbox().getX());
            player.handleHit(this.hitbox, 10);
        }
        // const collidingSide = player.getHitbox().getCollidingSide(this.hitbox);
        // const collidingSide2 = this.hitbox.getCollidingSide(player.getHitbox());
        // if(collidingSide !== null && collidingSide2 !== null)console.log(collidingSide, collidingSide2)
        // if(collidingSide !== null){ player.handleHit(this, collidingSide); }
    }

    /**
     * @param {number} deltatime
     * @param {Player} player 
     * @param {number[][]} grid 
     * @returns {void}
     */
    update(deltatime, player, grid){
        super.update(deltatime);
        this.handlePlayerCollision(player);
        this.updateFrameCounterCallBackfn();
        // this.checkForPlayer(player, grid);
        const   tileSize = this.game.getLevelManager().getTileSize(),
                colliderBlocks = Constants.Terrain.colliderBlocks,
                gridCenterX = Math.floor(this.hitbox.getCenterX() / tileSize),
                currentGridBottom = Math.floor((this.hitbox.getY() + this.hitbox.getHeight() - 1) / tileSize),
                futureGridBottom = Math.floor((this.hitbox.getY() + this.hitbox.getHeight() + this.velocityY) / tileSize),
                gridRight = Math.floor((this.hitbox.getX() + this.hitbox.getWidth()) / tileSize),
                futureGridRight = Math.floor((this.hitbox.getX() + this.hitbox.getWidth() + this.velocityX) / tileSize),
                gridLeft = Math.floor(this.hitbox.getX() / tileSize),
                futureGridLeft = Math.floor((this.hitbox.getX() + this.velocityX) / tileSize),
                rightSideBlock = grid[currentGridBottom + 1]?.[gridRight],
                leftSideBlock = grid[currentGridBottom + 1]?.[gridLeft];
        if(
            (   colliderBlocks.includes(grid[currentGridBottom + 1]?.[gridRight]) ||
                colliderBlocks.includes(grid[currentGridBottom + 1]?.[gridLeft]) )
            && futureGridBottom >= currentGridBottom + 1){
            this.hitbox.setY((currentGridBottom + 1) * tileSize -this.hitbox.getHeight());
            this.velocityY = 0;
            this.isOnGround = true;
        }
        if(
            (!colliderBlocks.includes(grid[currentGridBottom + 1]?.[futureGridRight]) || colliderBlocks.includes(grid[currentGridBottom]?.[futureGridRight])) ||
            (!colliderBlocks.includes(grid[currentGridBottom + 1]?.[futureGridLeft]) || colliderBlocks.includes(grid[currentGridBottom]?.[futureGridLeft])) //&&
            // !this.canSeePlayer
            ) {
                //!colliderBlocks.includes(grid[currentGridBottom + 1]?.[futureGridRight]) || colliderBlocks.includes(grid[currentGridBottom]?.[futureGridRight])
            //enter state idle for a couple of seconds
            this.idleThenSwitchDirections();
        }

        // const currentBottom = Math.floor((this.hitbox.getY() + this.hitbox.getHeight() - 1) / tileSize)
        // if(Constants.Terrain.colliderBlocks.includes(grid[currentBottom + 1]?.[gridCenterX]) && futureGridBottom >= currentBottom + 1){
        //     this.hitbox.setY((currentBottom + 1) * tileSize -this.hitbox.getHeight());
        //     this.velocityY = 0;
        //     this.isOnGround = true;
        //     this.#canDoubleJump = true;
        // }
    }

    updateFrameCounterCallBackfn(){
        if(this.lastFrame !== this.currentImageIndex){
            this.lastFrame = this.currentImageIndex;
            this.frameCount++;
            if(this.frameCount >= this.neededFrames){
                //leave current state
                this.frameCount = 0;
            }
        }
    }

    idleThenSwitchDirections(){
        // let preViousVelocityX = this.velocityX;
        if(this.justFlipped) { return; }
        this.justFlipped = true;
        this.velocityX = 0;
        this.setAnimation("Idle");
        setTimeout(() => {
            this.velocityX = (this.imageIsFlippedHorizontally) ? -this.maxSpeed : this.maxSpeed;
            this.imageIsFlippedHorizontally = !this.imageIsFlippedHorizontally;
            this.justFlipped = false;
            this.setAnimation("Run");
            // enter state walking, state walking should be able to switch ro running if this mushroom see's the player

        }, this.images.length * this.frameInterval * 3) //complete idle animation 2 times then enter runnig state
    }
}

export class AngryPig extends Enemy {

}