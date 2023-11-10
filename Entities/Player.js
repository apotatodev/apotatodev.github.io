import Constants from "../utils/Constants.js";
// import { DOUBLE_JUMP, FALLING, IDLE, JUMPING, RUNNING, WALL_JUMP } from "../utils/PlayerStates.js";
import Game from "../Game.js"
import Entity from "./Entity.js";
import { Enemy } from "./Enemies.js";
import Hitbox from "../utils/Htibox.js";
import Timer from "../utils/Timer.js";

export default class Player extends Entity {
    static imageWidth = Constants.Player.imageWidth;
    static imageHeight = Constants.Player.imageHeight;
    #imageMap;
    #maxJumpHeight = -8.7 * Constants.World.scaleUpTile;
    #normalMaxFallingSpeed = -this.#maxJumpHeight;
    #WALL_JUMP_MaxFallingSpeed = this.#normalMaxFallingSpeed * 0.3;
    maxFallingSpeed = this.#normalMaxFallingSpeed;
    #friction = 0.5 / Constants.World.scaleUpTile;
    #maxSpeed = 3.7 * Constants.World.scaleUpTile;
    #pushSpeed = this.#maxSpeed * 1.7;
    #hitSpeed = this.#maxSpeed / 2;
    #boostSpeed = this.#maxSpeed * 2;
    #timers = new Map([
        ["jumpCoolDown", new Timer(270)],
        ["hitCoolDown", new Timer(800)]
    ]);
    #health = 100;
    #fallThrowBlocks = false;
    #canDoubleJump = true;
    #canWallJump = false;
    #currentCharacter;
    #characterImages
    #states;

    /**
     * @param {Game} game
     * @param {number} x
     * @param {number} y
     * @param {string} currentCharacter
     * @param {Map<string, Image>} imageMap
     */
    constructor(game, x, y, imageMap, currentCharacter){
        super(game);
        this.#imageMap = imageMap;
        super.initializeHitbox(
            x,
            y,
            Player.imageWidth * Constants.World.scaleUpTile - 22,
            Player.imageHeight * Constants.World.scaleUpTile - 15,
            12,
            12
        );
        this.lastPos = {x: this.hitbox.getX(), y: this.hitbox.getY()};
        this.#currentCharacter = currentCharacter;
        this.#characterImages = this.#imageMap.get(this.#currentCharacter);        
        this.#states = new Map([
            [DOUBLE_JUMP.name, new DOUBLE_JUMP(this)],
            [FALLING.name, new FALLING(this)],
            [HIT.name, new HIT(this)],
            [IDLE.name, new IDLE(this)],
            [JUMPING.name, new JUMPING(this)],
            [RUNNING.name, new RUNNING(this)],
            [WALL_JUMP.name, new WALL_JUMP(this)]
        ]);
        this.omniDirectionalStates = [DOUBLE_JUMP.name, HIT.name, IDLE.name];
        this.enterState(FALLING.name);
    }

    /**
     * @param {string} timerName 
     * @returns {void}
     */
    activateTimer(timerName){
        this.#timers.get(timerName)?.activate();
    }

    applyForces(){
        //if moving right and switches direction or moving left and switches directions
        //set velocityX to 0 for proper acceleration
        if (
            // this check does not apply to the states listed in "omniDirectionalStates"
            !this.omniDirectionalStates.includes(this.currentState.constructor.name) &&
            (
                (!this.imageIsFlippedHorizontally && this.velocityX < 0) ||
                (this.imageIsFlippedHorizontally && this.velocityX > 0)
            )
        ) {
            this.velocityX = 0;
        }
        if(this.velocityY < this.maxFallingSpeed && !this.isOnGround) { this.velocityY += this.gravity; }
        else if(this.velocityY > this.maxFallingSpeed){ this.velocityY = this.maxFallingSpeed; }
        //normalize vectors
        // if( this.velocityX != 0 && this.velocityY != 0){
        //     this.velocityX = this.velocityX / Math.abs(this.velocityX);
        //     this.velocityY = this.velocityY / Math.abs(this.velocityY);
        //     this.velocityX *= Math.sqrt(this.maxSpeed * this.maxSpeed)
        //     this.velocityY *= Math.sqrt(this.maxFallingSpeed * this.maxFallingSpeed)
        // }
        this.updateHitbox(this.hitbox.getX() + this.velocityX, this.hitbox.getY() + this.velocityY);
    }

    /**
     * @override Entity.applyToVelocityX(vector: number);
     * @param {"push" | "hit" | "boost"} vectorType 
     * @param {boolean} isGoingLeft 
     * @returns {void}
     */
    applyToVelocityX(vectorType, isGoingLeft = !this.imageIsFlippedHorizontally){
        const vectorDirection = (isGoingLeft) ? -1 : 1;
        switch (vectorType) {
            case "push":
                super.applyToVelocityX(this.#pushSpeed * vectorDirection);
                break;
            case "hit":
                super.applyToVelocityX(this.#hitSpeed * vectorDirection);
                this.hitbox.setX(this.hitbox.getX() + 30 * vectorDirection);
                break;
            case "boost":
                super.applyToVelocityX(this.#boostSpeed * vectorDirection);
                break;
            default:
                break;
        }
    }

    /**
     * @overrides Entity.applyToVelocityY(vector: number);
     * @param {"push" | "hit" | "boost"} vectorType 
     * @param {boolean} isGoingUp
     * @returns {void}
     */
    applyToVelocityY(vectorType, isGoingUp=true){
        const vectorDirection = (isGoingUp) ? -1 : 1;
        switch (vectorType) {
            // case "push":
            //     super.applyToVelocityY(this.#pushSpeed * vectorDirection);
            //     break;
            case "hit":
                this.velocityY = 0;
                super.applyToVelocityY(this.#normalMaxFallingSpeed * vectorDirection * 0.5);
                break;
            // case "boost":
            //     super.applyToVelocityY(this.#boostSpeed * vectorDirection);
            //     break;
            default:
                break;
        }
    }

    get maxSpeed(){ return this.#maxSpeed; }



    get canDoubleJump(){
        return this.#canDoubleJump;// && this.currentState.constructor.name === "FALLING";
    }

    set canDoubleJump(canDoubleJump){
        this.#canDoubleJump = canDoubleJump;
    }

    get canJump(){ return !this.#timers.get("jumpCoolDown").isActive(); }

    get canWallJump(){ return this.#canWallJump; }

    get fallThrowBlocks(){ return this.#fallThrowBlocks; }

    enterState(stateName){
        this.currentState = this.#states.get(stateName);
        const resetAnimation = this.currentState.enterState();
        if(!resetAnimation) return;
        //else reset animation to match new state

        // this.maxFrame = this.currpentState.maxFrame;
        this.currentImageIndex = 0;
        this.frameInterval = 1000 / this.currentState.fps;//1 second divided by frames per second = "frameInterval"
        this.images = this.#characterImages.get(this.currentState.imageName);
        // this.image = this.#characterImages.get(this.currentState.imageName);
        this.image = this.images[this.currentImageIndex];
    }

    /**
     * 
     * @param {Map<String, Number} objects
     * @param {number[][]} grid
     * @returns {void}
     */
    handleCollision(objects, grid){
        this.isOnGround = false;
        // this.#handleCollisionEntities(objects);
        this.#handleCollisionTerrain(grid)
    }


    /**
     * 
     * @param {number[][]} grid
     * @returns {void}
     */
    #handleCollisionTerrain(grid){
        const tileSize = this.game.getLevelManager().getTileSize();
        this.#canWallJump = false;

        const   centerX = this.hitbox.getCenterX(),
                centerY = this.hitbox.getCenterY(),
                gridCenterX = Math.floor(centerX / tileSize),
                gridCenterY = Math.floor(centerY / tileSize),
                currentBottom = Math.floor((this.hitbox.getY() + this.hitbox.getHeight() - 1) / tileSize),
                top = this.hitbox.getY() + this.velocityY,
                futureLeftPos = this.hitbox.getX() + this.velocityX,
                futureRightPos = futureLeftPos + this.hitbox.getWidth(),
                futureBottomPos = this.hitbox.getY() + this.hitbox.getHeight() + this.velocityY,
                gridTop = Math.floor(top / tileSize),
                blockBelowPlayer = grid[currentBottom + 1]?.[gridCenterX],
                blockAbovePlayer = grid[gridTop]?.[gridCenterX],
                blockRightOfPlayer = grid[gridCenterY]?.[Math.floor(futureRightPos / tileSize)],
                blockLeftOfPlayer = grid[gridCenterY]?.[Math.floor(futureLeftPos / tileSize)];

        // if(Constants.Terrain.colliderBlocks.includes(grid[currentBottom + 1]?.[gridCenterX]) && Math.floor(futureBottomPos / tileSize) >= currentBottom + 1){}
        // players feet are touching the ground or a fall throw block and fall throw is not active
        if(
            Math.floor(futureBottomPos / tileSize) >= currentBottom + 1 && (
                blockBelowPlayer === Constants.Terrain.collisionBlock ||
                (blockBelowPlayer === Constants.Terrain.jumpThroughAbleBlock && !this.#fallThrowBlocks)
            )
        ){
            this.hitbox.setY((currentBottom + 1) * tileSize -this.hitbox.getHeight());
            this.velocityY = 0;
            this.isOnGround = true;
            this.#canDoubleJump = true;
        }
        if(blockAbovePlayer === Constants.Terrain.collisionBlock){
            this.hitbox.setY((gridTop + 1) * tileSize);
            this.velocityY = 0;
        }
        if(blockRightOfPlayer === Constants.Terrain.collisionBlock || blockLeftOfPlayer === Constants.Terrain.collisionBlock){
            const newXPos = (blockRightOfPlayer === Constants.Terrain.collisionBlock) ?
                // player is colliding right
                Math.floor(futureRightPos / tileSize) * tileSize -this.hitbox.getWidth() + 1:
                // player is colliding left
                (Math.floor(futureLeftPos / tileSize) + 1) * tileSize - 1;

            this.hitbox.setX(newXPos);
            this.imageIsFlippedHorizontally = (blockLeftOfPlayer === Constants.Terrain.collisionBlock);
            this.velocityX = 0;
            this.#canWallJump = !this.isOnGround;
        }
        if(
            this.velocityY > 0 &&
            (
                (grid[currentBottom][Math.floor((futureLeftPos - this.velocityX - 1) / tileSize)] === Constants.Terrain.collisionBlock && this.velocityX < 0) ||
                (grid[currentBottom][Math.floor((futureRightPos - this.velocityX - 1) / tileSize)] === Constants.Terrain.collisionBlock && this.velocityX > 0)
            )
            // (grid[Math.floor(futureBottomPos / tileSize)]?.[Math.floor(futureRightPos / tileSize)] === Constants.Terrain.collisionBlock &&
            // Math.floor(futureBottomPos / tileSize) > Math.floor((futureBottomPos - this.velocityY) / tileSize) &&
            // Math.floor(futureRightPos / tileSize) > Math.floor((futureRightPos - this.velocityX) / tileSize)) ||
            // (grid[Math.floor(futureBottomPos / tileSize)]?.[Math.floor(futureLeftPos / tileSize)] === Constants.Terrain.collisionBlock &&
            // Math.floor(futureBottomPos / tileSize) > Math.floor((futureBottomPos - this.velocityY) / tileSize) &&
            // Math.floor(futureLeftPos / tileSize) > Math.floor((futureLeftPos - this.velocityX) / tileSize))
        ) {
            this.velocityX = 0;
            // this.velocityY = 0;
            this.hitbox.setY((currentBottom) * tileSize -this.hitbox.getHeight() + 1);
            const newXPos = ((this.velocityX > 0) ?
                // player is colliding right
                Math.floor(futureRightPos / tileSize) * tileSize -this.hitbox.getWidth() - 1:
                // player is colliding left
                (Math.floor(futureLeftPos / tileSize) + 1) * tileSize + 1);
            this.hitbox.setX(newXPos);
            // if(Math.abs(this.velocityY) > Math.abs(this.velocityX)){
            //     this.hitbox.setY((currentBottom + 1) * tileSize -this.hitbox.getHeight());
            //     this.velocityY = 0;
            //     this.isOnGround = true;
            //     this.#canDoubleJump = true;
            // }else{
            //     const newXPos = (blockRightOfPlayer === Constants.Terrain.collisionBlock) ?
            //     // player is colliding right
            //     Math.floor(futureRightPos / tileSize) * tileSize -this.hitbox.getWidth():
            //     // player is colliding left
            //     (Math.floor(futureLeftPos / tileSize) + 1) * tileSize;

            //     this.hitbox.setX(newXPos);
            //     this.velocityX = 0;
            //     this.#canWallJump = !this.isOnGround;
            // }
        }
        // if(blockDiagonalDownLeftOfPlayer === Constants.Terrain.collisionBlock) {
        //     if(Math.abs(this.velocityX) > Math.abs(this.velocityY)){

        //     }else{

        //     }
        // }
    }

    /**
     * @returns {void}
     * @param {Hitbox} hitbox
     * @param {number} damage 
     */
    handleHit(hitbox, damage){
        
        // if(!this.#timers.get("hitCoolDown").isActive()) {
        //     this.velocityX = 0;
        //     // return;
        // }
        if(this.currentState.constructor.name === HIT.name || this.#timers.get("hitCoolDown").isActive()){ return; }
        const isToTheLeftOfEntity = hitbox.getX() > this.hitbox.getX();
        this.imageIsFlippedHorizontally = !isToTheLeftOfEntity;
        this.velocityX = 0;
        this.enterState(HIT.name);
        this.applyToVelocityY("hit");
        this.applyToVelocityX("hit", isToTheLeftOfEntity);
        this.handleHealthChange(-damage);
    }

    /**
     * @param {number} modifier 
     * @returns {void}
     */
    handleHealthChange(modifier){
        this.#health += modifier;

        if(this.#health <= 0){
            // end game
        }
    }

    /**
     * 
     * @param {{up: boolean, down: boolean, right: boolean, left: boolean, space: boolean, attack: boolean}} keyBoardInputs 
     * @returns {void}
     */
    handleInputs(keyBoardInputs){
        if(Math.abs(this.velocityX) > this.#maxSpeed) return;

        if (keyBoardInputs.right){
            this.imageIsFlippedHorizontally = false;
            this.velocityX += (this.#maxSpeed - Math.abs(this.velocityX)) * 0.25;
        }
        else if (keyBoardInputs.left){
            this.imageIsFlippedHorizontally = true;
            this.velocityX -= (this.#maxSpeed - Math.abs(this.velocityX)) * 0.25;
        }
        if((!keyBoardInputs.right && !keyBoardInputs.left) || this.currentState.constructor.name === HIT.name) {
            this.velocityX *= this.currentState.constructor.name === HIT.name ? this.#friction * Constants.World.scaleUpTile * 2 : this.#friction;
        }
        
        this.#fallThrowBlocks = keyBoardInputs.down;
        //when players velocity magnitude is to small: set to 0
        if(Math.abs(this.velocityX) < this.#maxSpeed / 5 && this.velocityX != 0){ this.velocityX = 0; }
    }

    #updateTimers(deltatime){
        Timer.updateAll(deltatime);
    }

    jump(){
        this.#timers.get("jumpCoolDown").activate();
        this.velocityY = this.#maxJumpHeight;
        this.isOnGround = false;
        // if(this.#canWallJump) {
        //     this.velocityX += 90//(this.velocityX < 0) ? -15: 15;
        //     // this.hitbox.addX(20)
        // }
        // this.player.getHitbox().setY(this.player.getHitbox().getY() - 1);
    }

    /**
     * @param {"normal" | "WALL_JUMP"} typeOfFallpingSpeed 
     * @returns {void}
    */
    setMaxFallingSpeed(typeOfFallpingSpeed = "normal"){
        switch (typeOfFallpingSpeed) {
            case "WALL_JUMP":
                this.maxFallingSpeed = this.#WALL_JUMP_MaxFallingSpeed;
                break;
            case "normal":
                this.maxFallingSpeed = this.#normalMaxFallingSpeed;
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param {Number} deltatime 
     * @param {Object} keyBoardInputs
     * @param {Map<String, Number>} objects
     * @param {number[][]} grid
     */
    update(deltatime, keyBoardInputs, objects, grid){
        this.animate(deltatime);
        this.currentState.handleInput(keyBoardInputs);
        this.applyForces(deltatime);
        this.handleInputs(keyBoardInputs);
        this.handleCollision(objects, grid);
        this.#updateTimers(deltatime);
    }
}



// ________ player state manger from here down ____________________


const RESET_ANIMATION = true;

//this class is only supposed to be used as a type and perant class
/**@abstract*/
class States {
    /**
     * @param {Player} player 
     * @param {number} maxFrame 
     * @param {string} imageName 
     * @param {number} fps
     */
    constructor(player, maxFrame, imageName, fps = player.fps){
        this.player = player;
        this.maxFrame = maxFrame;
        this.imageName = imageName;
        this.fps = fps;
        this.name = this.constructor.name;
    }

    /**
     * 
     * @param {Object} input 
     */
    handleInput(input){
        if(this.player.isOnGround && this.constructor.name !== "RUNNING" && this.constructor.name !== "IDLE") { this.player.enterState("RUNNING"); }
        else if(this.player.getVelocityY() > 0 && this.constructor.name !== "FALLING") { this.player.enterState("FALLING"); }

        /*
        const stateName = this.constructor.name;
        if(this.player.isOnGround) {
            if(this.player.getVelocityX() !== 0){
                if(stateName !== "RUNNING"){ this.player.enterState("RUNNING"); }
            } else if(stateName !== "IDLE"){ this.player.enterState("IDLE"); }
        } else if(this.player.getVelocityY() > 0) {
            if( && stateName !== "WALL_JUMP" && stateName !== "FALLING")
            this.player.enterState("FALLING");
        }
        if(stateName !== "JUMPING"){
            if(input.up && this.player.canJump){ this.player.enterState("JUMPING"); }    
        } else if(input.up && this.player.canDoubleJump){ this.player.enterState("JUMPING"); }
        */
    }

    enterState(){
        return RESET_ANIMATION; // true resets the animation to the new state animation
    }
}

class DOUBLE_JUMP extends States{
    constructor(player){
        super(player, 5, "double_jump", 40);
    }

    enterState(){
        this.player.jump();
        this.player.canDoubleJump = false;
        return RESET_ANIMATION;
    }
}

class FALLING extends States{
    constructor(player){
        super(player, 0, "fall");
    }

    enterState(){
        this.player.setMaxFallingSpeed("normal");
        return RESET_ANIMATION;
    }

    handleInput(input){
        if(this.player.canWallJump){ this.player.enterState("WALL_JUMP"); }
        else if(this.player.isOnGround) { this.player.enterState("RUNNING"); }
        else if(input.up && this.player.canDoubleJump) { this.player.enterState("DOUBLE_JUMP"); }
    }
}

class IDLE extends States{
    constructor(player){
        super(player, 10, "idle");        
    }

    handleInput(input){
        if(this.player.isOnGround){
            if(input.up && this.player.canJump){
                this.player.enterState("JUMPING");
            }
            else if (this.player.getVelocityX() !== 0) this.player.enterState("RUNNING");
        }
        else this.player.enterState("FALLING");
    }
}

class JUMPING extends States{
    constructor(player){
        super(player, 0, "jump");
    }
    enterState(){
        this.player.jump();
        return RESET_ANIMATION;

        // if(this.player.canJump || this.player.canWallJump){
        //     if (this.player.isOnGround){
        //         this.player.jump();
        //     } else if(this.player.canWallJump){
        //         this.player.enterState("WALL_JUMP");
        //         return RESET_ANIMATION;
        //     } else if(this.player.canDoubleJump){
        //         this.player.enterState("DOUBLE_JUMP");
        //         return RESET_ANIMATION;
        //     }
        // } else return RESET_ANIMATION;
        
        // return !RESET_ANIMATION;
    }
    handleInput(input){
        if(this.player.isOnGround){
            this.player.enterState('RUNNING');
        }
        // else if(input.up && this.player.canDoubleJump) { this.player.enterState("DOUBLE_JUMP"); }//double jump
        // else if(input.up) this.player.enterState("DOUBLE_JUMP");//double jump
        else if(this.player.velocityY > 0) this.player.enterState('FALLING');
    }
}

class HIT extends States{
    constructor(player){
        super(player, 6, "hit",);
    }

    handleInput(input){
        if(this.player.currentImageIndex === this.player.images.length) {
            this.player.activateTimer("hitCoolDown");
            this.player.enterState(RUNNING.name);
        }

        // if(input.up){
        //     this.player.enterState('JUMPING');
        // }
        // if(this.player.isOnGround){
        //     this.player.enterState('RUNNING');
        // }
        // else if(this.player.velocityY > 0){
        //     this.player.enterState('FALLING');
        // }
    }
}

class RUNNING extends States{
    constructor(player){
        super(player, 11, "run", 40);
    }
    handleInput(input){
        if(this.player.isOnGround){
            if(input.up) { this.player.enterState("JUMPING") }
            else if(this.player.velocityX === 0) { this.player.enterState('IDLE'); }
        }
        else { this.player.enterState('FALLING'); }
    }
}

class WALL_JUMP extends States{
    constructor(player){
        super(player, 4, "wall_jump");
    }

    enterState(){
        // super.enterState()
        this.player.setMaxFallingSpeed("WALL_JUMP");
        return RESET_ANIMATION;
    }

    handleInput(input){
        if(this.player.isOnGround) { this.player.enterState('RUNNING'); }
        else if(!this.player.canWallJump){
            this.player.enterState("FALLING");
            this.player.canDoubleJump = true;
        }
        else if(input.up) {
            this.player.applyToVelocityX("push");
            this.player.enterState('DOUBLE_JUMP');
        }
    }
}