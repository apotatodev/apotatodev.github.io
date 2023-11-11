import Player from "./Entities/Player.js";
import InputHandler from "./Input.js";
import LevelManager from "./levelManager/LevelManager.js";
import Constants from "./utils/Constants.js";
import { Enemy } from "./Entities/Enemies.js";
import { Fruit, Apple } from "./Entities/Fruits.js";
import { LinkedList } from "./utils/UtilityHandlers.js";
import Entity from "./Entities/Entity.js";
import { Box } from "./Entities/Boxes.js";
import UI from "./UI.js";

export default class Game {
    #UPDATES_PERSECOND;
    #FPS;
    #isGameover;
    #timer;
    #score;
    #audioMap;
    #currentLevel = parseInt(localStorage.getItem("currentLevel") ?? "0");
    #imageMap;
    #inputs;
    #boxes = new LinkedList(null);
    #enemies = new LinkedList(null);
    #fruits = new LinkedList(null);
    /**
     * @param {Map<string, Map<string, Image | Map<string, Image | Map<string, Image>>>>} imageMap 
     * @param {Map<string, HTMLAudioElement>} audioMap 
    */
   constructor(imageMap, audioMap){
    // comsole log debugger don't ask why 
    console.a = (...args) => { if (this.getDebug()) console.log(...args); }
       this.#imageMap = imageMap;
       this.#audioMap = audioMap;
       console.log(this.getImages("Item/Fruit"))

        this.#isGameover =  false;
        this.timer = 0;

        this.score = 0;

        this.offsetX = 0;
        this.offsetY = 0;
        this.scrollAreaWidth = 150 * SCALE_UP;
        this.scrollAreaHeight = 75 * SCALE_UP;

        this.#currentLevel = 0

        //todo: make better image managing system
        //all images used in game
        this.#inputs = new InputHandler();
        this.ui = new UI(this);
        this.levelManager = new LevelManager(this, this.#imageMap.get("Terrain"));
        this.player = new Player(this, 300, 200, this.#imageMap.get("MainCharacters"), "VirtualGuy");
    }

    /**
     * @param {Box} box 
     * @returns {void}
     */
    addBox(box){
        LinkedList.insertValue(this.#boxes, box);
    }

    /**
     * @param {Enemy} enemy 
     * @returns {void}
     */
    addEnemy(enemy){
        LinkedList.insertValue(this.#enemies, enemy)
    }

    /**
     * @param {Entity} entity 
     * @returns {void}
     */
    addEntity(entity){
        if(entity instanceof Box){
            this.addBox(entity);
        }else if(entity instanceof Fruit){
            this.addFruit(entity);
        } else if(entity instanceof Enemy){
            this.addEnemy(entity);
        }
    }

     /**
     * @param {Fruit} fruit 
     * @returns {void}
     */
    addFruit(fruit){
        LinkedList.insertValue(this.#fruits, fruit);
    }

    /**
     * @returns {number}
     */
    getCurrentLevel(){ return this.#currentLevel; }

    /**
     * @returns {boolean}
     */
    getDebug(){ return this.#inputs.getDebug(); }

    // fix later, still works
    /**
     * @param {string} imageNameOrPathName 
     * @returns {Map<string, Image | Map<string, Image | Map<string, Image>>> | Image | undefined}
     */
    getImages(imageNameOrPathName){

        //this will work even if niether ("/" or "\\") are present in the string
        const keys = imageNameOrPathName.replace(/\\/g, "/").split("/");
        let mapOrImage = this.#imageMap;
        for(const key of keys){
            mapOrImage = mapOrImage.get(key);
            if(mapOrImage === undefined) return undefined; 
        }
        return mapOrImage;
    }

    /**
     * @returns {LevelManager}
     */
    getLevelManager(){ return this.levelManager; }

    /**
     * @returns {boolean}
     */
    getIsGameover(){ return this.#isGameover; }

    /**
    * @returns {boolean}
    */
    getGameIsPaused() { return this.#inputs.getGameIsPaused() }

    /**
     * 
     * @returns {UI}
     */
    getUI(){ return this.ui; }

    /**
     * 
     * @returns {Promise<void>}
     */
    pauseGame() {
        return new Promise(resolve => {
            const thisInterval = setInterval(() => {
                if( !this.#inputs.getGameIsPaused() ){
                    clearInterval(thisInterval);
                    resolve();
                }
            }, 100);
        });
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context
     * @returns {void}
     */
    draw(context){
        this.levelManager.draw(context, this.offsetX, this.offsetY);
        LinkedList.forEachValue(this.#boxes.next, box => box.draw(context, this.offsetX, this.offsetY) );
        LinkedList.forEachValue(this.#fruits.next, fruit => fruit.draw(context, this.offsetX, this.offsetY) );
        LinkedList.forEachValue(this.#enemies.next, enemy => enemy.draw(context, this.offsetX, this.offsetY) );
        this.player.draw(context, this.offsetX, this.offsetY);
        this.ui.draw(context);
    }

    #scrollWindow(){
        const hitbox = this.player.getHitbox();
        // if(
        //     ( (hitbox.getX() + hitbox.getWidth() - this.offsetX >= Constants.World.width - this.scrollAreaWidth) && this.player.getVelocityX() > 0 ) ||
        //     ((hitbox.getX() - this.offsetX <= this.scrollAreaWidth) && this.player.getVelocityX() < 0)
        // ){
        //     this.offsetX += this.player.getVelocityX();
        // }

        if((hitbox.getY() + hitbox.getHeight() - this.offsetY >= Constants.World.height - this.scrollAreaHeight)){
            this.offsetY -= ((Constants.World.height - this.scrollAreaHeight) -(hitbox.getY() + hitbox.getHeight() - this.offsetY)) * 0.02 * (Math.abs(this.player.getVelocityY()) || 5);
        }
        if(hitbox.getY() - this.offsetY <= this.scrollAreaHeight){
            this.offsetY += (hitbox.getY() - this.offsetY - this.scrollAreaHeight) * 0.02 * (Math.abs(this.player.getVelocityY()) || 5);
        }


        if((hitbox.getX() + hitbox.getWidth() - this.offsetX >= Constants.World.width - this.scrollAreaWidth)){
            this.offsetX -= ((Constants.World.width - this.scrollAreaWidth) -(hitbox.getX() + hitbox.getWidth() - this.offsetX)) * 0.02 * (Math.abs(this.player.getVelocityX()) || 5);
        }
        if(hitbox.getX() - this.offsetX <= this.scrollAreaWidth){
            this.offsetX += (hitbox.getX() - this.offsetX - this.scrollAreaWidth) * 0.02 * (Math.abs(this.player.getVelocityX()) || 5);
        }
    }

    /**
     * @param {number} deltatime
     * @returns {void} 
     */
    update(deltatime){
        // console.log(deltatime)
        this.#scrollWindow();
        const collisionGrid = this.levelManager.getCollisionGrid();
        this.player.update(deltatime, this.#inputs.getKeys(), {}, collisionGrid);
        LinkedList.filter(this.#fruits.next, fruit => {
            fruit.update(deltatime, this.player);
            if(fruit.getIsMarkedForDeletion()) {
                this.ui.incrementFruitCount(fruit.constructor.name);
                return false;
            }
            return true;
        }, this.#fruits);
        LinkedList.filter(this.#enemies.next, enemy => {
            enemy.update(deltatime, this.player, collisionGrid);
            return !enemy.getIsMarkedForDeletion();
        }, this.#fruits);
    }
}