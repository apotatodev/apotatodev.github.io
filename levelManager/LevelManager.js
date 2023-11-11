import level1Data from "../level-data/level-editor-data/level1.json" assert {"type": "json"};
import Game from "../Game.js";
import Constants from "../utils/Constants.js";
import { oneDGridTo2DGrid } from "../utils/Utils.js"
import Entities from "../Entities/Entities.js";
import Entity from "../Entities/Entity.js";
import { Enemy } from "../Entities/Enemies.js";
import { Fruit } from "../Entities/Fruits.js";

const levels = [
    level1Data
]

export default class LevelManager {

    #game
    #terrainImage
    #backgroundImage;
    #terrainGrid;
    #collisionGrid;
    #entitiesGrid
    #tileSizeScale;
    #imageCollumns;
    #tileSize;
    #mapHeight;
    #mapWidth;
    #tileTypeColor = new Map([
        [Constants.Terrain.jumpThroughAbleBlock, `rgba(255,255,0,0.4)`],
        [Constants.Terrain.collisionBlock, `rgba(255,0,0,0.4)`],
        [Constants.Terrain.airBlock, `rgba(0,255,0,0.4)`],
    ]);

    /**
     * @param {Map<string, Image>} imageMap 
     * @param {Game} game
     * @param {number} currentLevel
     */
    constructor(game, imageMap, currentLevel = 0) {
        this.#game = game;
        this.#terrainImage = Array.from(imageMap.values())[0];
        this.#tileSizeScale = Constants.World.scaleUpTile;
        this.loadLevel(currentLevel);
    }

    /**
     * @param {Entity} entity 
     * @returns {void}
     */
    #addToEntityGrid(entity){
        const hitbox = entity.getHitbox();
        if(!hitbox) { return; }
        const uniqueGridPositions = new Set([
            [Math.floor(hitbox.getX() / this.#tileSize), Math.floor(hitbox.getY() / this.#tileSize)],
            [Math.floor(hitbox.getXWithWidth() / this.#tileSize), Math.floor(hitbox.getY() / this.#tileSize)],
            [Math.floor(hitbox.getX() / this.#tileSize), Math.floor(hitbox.getYWithHeight() / this.#tileSize)],
            [Math.floor(hitbox.getXWithWidth() / this.#tileSize), Math.floor(hitbox.getYWithHeight() / this.#tileSize)],
        ]);
        for(const [x, y] of uniqueGridPositions) { this.#entitiesGrid[y][x].push(entity); }
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} offsetX 
     * @param {number} offsetY 
     */
    draw(context, offsetX, offsetY) {
        context.save();
        context.imageSmoothingQuality = "high";
        context.imageSmoothingEnabled = false;
        this.#drawBackground(context, offsetX, offsetY);
        this.#drawTerrain(context, offsetX, offsetY);
        context.restore();
    }
    
    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {number} offsetX 
     * @param {number} offsetY 
     */
    #drawTerrain(context, offsetX, offsetY) {

        this.#terrainGrid.forEach((rows, y) => {
            rows.forEach((tileID, x) => {
                context.drawImage(
                    this.#terrainImage,
                    tileID % this.#imageCollumns * this.#tileSize / this.#tileSizeScale,
                    Math.floor(tileID / this.#imageCollumns) * this.#tileSize / this.#tileSizeScale,
                    this.#tileSize / this.#tileSizeScale,
                    this.#tileSize / this.#tileSizeScale,
                    x * this.#tileSize - offsetX,
                    y * this.#tileSize - offsetY,
                    this.#tileSize,
                    this.#tileSize,
                );

                //draw collisons when f is clicked
                if(this.#game.getDebug()) {
                    context.save();
                    context.fillStyle = this.#tileTypeColor.get( this.#collisionGrid[y][x] );
                    context.fillRect(x * this.#tileSize - offsetX, y * this.#tileSize - offsetY, this.#tileSize + 2, this.#tileSize + 2);
                    context.restore();
                }
            });
        });
    }

    /**
     * @param {CanvasRenderingContext2D} context
     * @param {number} offsetX 
     * @param {number} offsetY 
     * @returns {void}
     */
    #drawBackground(context, offsetX, offsetY){
        const numRows = Math.ceil((Constants.World.height + Math.abs(offsetY)) / this.#tileSize), numColumns = Math.ceil((Constants.World.width + Math.abs(offsetX)) / this.#tileSize);
        for (let row = 0; row < numRows; row++) {
            for (let column = 0; column < numColumns; column++) {
                // console.log(column * this.#tileSize - offsetX, row * this.#tileSize - offsetY);
                context.drawImage(
                    this.#backgroundImage,
                    column * this.#tileSize,
                    row * this.#tileSize
                );
            }
        }
    }

    initializeClasses(){
        /**@type {typeof Enemy[]} */ const unInitializedClasses = [
            Mushroom,
            AngryPig
        ];
        const EnemyImages = this.#game.getImages("Enemies");
        unInitializedClasses.forEach(Class => {

            const _images = EnemyImages.get(Class.name);
            (new Map()).entries
            const images = new Map([_images.entries().map(entry => {
                
            })]);
            Class.initialize(EnemyImages.get(Class.name), )
        });
        // EnemyImages.get("Enimies/Mushroom");

        // Mushroom.initialize(rootPath + rootPath + );
        // AngryPig.initialize(rootPath + AngryPig.name);
    }

    // ignore this it needs to be refactored
    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    isCollidingWithTerrain(x, y) {
        //if there outside of the grid they would have had to collide with a tile to get there
        const isOnGround = this.isInGrid(x, y);
        
        const gridX = Math.floor(x / this.#tileSize), gridY = Math.floor(y / this.#tileSize);
        return !isOnGround || this.#terrainGrid[gridY][gridX] !== Constants.Terrain.airBlock;
    }

    // ignore this it needs to be refactored
    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    isInGrid(x, y){
        const gridX = Math.floor(x / this.#tileSize), gridY = Math.floor(y / this.#tileSize);
        return (
            gridY < this.#terrainGrid.length && gridY !== Constants.Terrain.airBlock &&
            gridX < this.#terrainGrid[gridY].length && gridX !== Constants.Terrain.airBlock
        );
    }

    /**
     * @returns {Entity[][][]}
     */
    getEntitiesGrid(){ return this.#entitiesGrid; }

    /**
     * @returns {number}
     */
    getTileSize() { return this.#tileSize; }

    /**
     * @returns {number[][]}
     */
    getTerrain(){ return this.#terrainGrid; }

    /**
     * @returns {number[][]}
     */
    getCollisionGrid(){ return this.#collisionGrid; }

    /**
     * @param {{
        * "gid": number, 
        * "height": number, 
        * "id": number,
        * "name": string,
        * "rotation":number,
        * "type": string,
        * "visible": boolean,
        * "width": number,
        * "x": number,
        * "y": number
    * }[]} entitiesData
    * @param {{
        * columns: number;
        * firstgid: number;
        * image: string;
        * imageheight: number;
        * imagewidth: number;
        * margin: number;
        * name: string;
        * spacing: number;
        * tilecount: number;
        * tileheight: number;
        * tilewidth: number;
        * grid?: undefined | {};
        * tiles: [];
    *}} entitytileSet
     */
    #loadEntites(entitiesData, entitytileSet){
        const idToEntityMap = new Map(entitytileSet.tiles.map(tile => [tile.id + entitytileSet.firstgid, tile.type]));
        console.log(idToEntityMap)
        entitiesData.forEach(entityData => {
            const entityClassName = idToEntityMap.get(entityData.gid);
            if(entityClassName === "MainCharacters"){
                // load player
                console.log();
                return;
            }

            const /**@type {(typeof Entity)}*/EntityClass = Entities[entityClassName];
            if(EntityClass === undefined) {
                throw new Error(`unknown Entity type in tilemap. name: ${idToEntityMap.get(entityData.gid)}, id: ${entityData.gid}`);
            }

            //add to top left display
            // console.log(EntityClass.name)
            // if(EntityClass.__proto__ === Fruit){
            //     this.#game.getUI().addFrutToFruitsDisplay(EntityClass.name);
            // }else if(EntityClass.__proto__ === Fruit){

            // }

            let entity;
            switch (EntityClass.name) {
                case "Apple":
                    console.log(EntityClass.__proto__ === Fruit);
                    // i probably just the defualt constructor caller for apple xD
                    entity = new EntityClass(this.#game, entityData.x * Constants.World.scaleUpTile, entityData.y * Constants.World.scaleUpTile - entityData.height);
                    break;
                case "Mushroom":
                    entity = new EntityClass(this.#game, entityData.x * Constants.World.scaleUpTile, entityData.y * Constants.World.scaleUpTile - entityData.height * Constants.World.scaleUpTile);
                    break;
            
                default:
                    //default params
                    // console.log(EntityClass.name, EntityClass.__proto__ instanceof Fruit)
                    entity = new EntityClass(this.#game, entityData.x * Constants.World.scaleUpTile, entityData.y * Constants.World.scaleUpTile - entityData.height);
                    break;
            }

            // this.#addToEntityGrid(entity);
            this.#game.addEntity(entity);
        });
    }

    /**
     * @param {number} currentLevel 
     * @returns {void}
     */
    loadLevel(currentLevel){
        const levelData = levels[currentLevel];
        const backgroundImageName = (levelData.properties.find(property => property.name === "Background")).value;
        this.#backgroundImage = this.#game.getImages("Background/" + backgroundImageName);
        this.#tileSize = levelData.tileheight * this.#tileSizeScale;
        this.#imageCollumns = (levelData.tilesets.find(tileSet => tileSet.name === "terrain")).columns;
        this.#mapHeight = levelData.height;
        this.#mapWidth = levelData.width;

        levelData.layers.forEach(layer => {
            switch (layer.name) {
                case "tileSection":
                    this.#terrainGrid = oneDGridTo2DGrid(layer.data, this.#mapHeight, this.#mapWidth, item => item - 1);
                    console.log(this.#terrainGrid)
                    break;
                case "collisionsAndJumpThroughs":
                    this.#collisionGrid = oneDGridTo2DGrid(layer.data, this.#mapHeight, this.#mapWidth, item => item - 1);
                    break;
                case "entities":
                    this.#entitiesGrid = Array.from(new Array(this.#mapHeight), () => Array.from(new Array(this.#mapWidth), () => []));
                    console.log(this.#entitiesGrid)
                    this.#loadEntites(layer.objects, levelData.tilesets.find(tileSet => tileSet.name === "entities"));
                default:
                    // huh? why u add weird layer?? xD
                    break;
            }
        });
        console.log(this.#entitiesGrid)
    }
}