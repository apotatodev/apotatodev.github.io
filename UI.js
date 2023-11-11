import Game from "./Game.js";
import Constants from "./utils/Constants.js";

export default class UI {
    #game;
    #displayedImages;
    /**
     * 
     * @param {Game} game 
     */
    constructor(game){
        this.#game = game;
        // debugger
        console.log(this.#game.getImages("Items/Fruit"))
        this.fruitImages = Array.from(this.#game.getImages("Items/Fruit").values(), images => images[0]);
        this.fruitCounter = new Map();
        // this.enemyImages = Array.from(this.#game.getImages("Enemies").values());
        // console.log(this.enemyImages)
        this.fontSize = 30;
        this.fontFamily = "kristen ITC";
        this.#displayedImages = new Map();
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @returns {void}
     */
    draw(context) {
        context.save();
        let x = 0, y = 0, prevY, drawOffsetX = 40, drawOffsetY = 35;
        context.imageSmoothingQuality = "high";
        context.imageSmoothingEnabled = false;
        context.textAlign = "left";
        context.font = this.fontSize + "px " + this.fontFamily;
        context.fillStyle = "lightgray";

        // console.log(this.#displayedImages)
        this.#displayedImages.forEach(image => {
            prevY = Math.max(prevY, image.height);
            if(x > Constants.World.width + image.width){
                x = 0;
                y += prevY;
            }

            // 
            context.drawImage(
                image,
                x - drawOffsetX,
                y - drawOffsetY,
                image.width * SCALE_UP * 2,
                image.height * SCALE_UP * 2
            );

            //
            context.fillText(this.fruitCounter.get(image.src), x + image.width + 4 * ((SCALE_UP - 1) * 2), y + image.height * SCALE_UP - 6 * SCALE_UP);
            drawOffsetX *= 2;
            drawOffsetY *= 2;
            x += image.width;
        });
        context.restore();
    }

    // get displayedImages(){ return this.#displayedImages; }

    /**
     * @return {void}
     * @param {string} FruitName 
     */
    incrementFruitCount(FruitName){

        //get image
        const image = this.fruitImages.find(({src}) => src.includes(FruitName));
        if(!image) { return; }

        // if we are currently displaying the image on the screen
        if(this.#displayedImages.has(image.src)){
            this.fruitCounter.set(
                image.src,
                this.fruitCounter.get(image.src) + 1
            );
        } else  {
            this.#displayedImages.set(image.src, image);
            this.fruitCounter.set(image.src, 1);
        }
    }
}