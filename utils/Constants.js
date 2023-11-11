export default {
    Player: {
        width: 21,
        height: 21,
        imageWidth: 32,
        imageHeight: 32,
    },
    Terrain: {
        collisionDataName: "collisionsAndJumpThroughs",
        terrainDataName: "tileSection",
        jumpThroughAbleBlock: 20,
        collisionBlock: 21,
        get colliderBlocks() { return [this.jumpThroughAbleBlock, this.collisionBlock]; },
        airBlock: -1
    },
    Background: {
        terrainBlockSize: 96,
        bgTileSize: 64,
    },
    World:{
        scaleUpTileDefault: 2,
        height: 660,
        width: 1152
    },
    Entities: {
        MushroomId: 2
    },
    imageRootPath: "assets/"
}