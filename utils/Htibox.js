export default class Hitbox {
    #x
    #y
    #width
    #height
    #offsetX
    #offsetY
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height
     * @param {number} offsetX
     * @param {number} offsetY
     */
    constructor(x, y, width, height, offsetX = 0, offsetY = 0){
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#offsetX = offsetX;
        this.#offsetY = offsetY;
    }
    
    
    /**
     * @param {Hitbox} hitbox1
     * @param {Hitbox} hitbox2
     * @returns {boolean}
     */
    static isColliding(hitbox1, hitbox2){
        // when both hitboxes are initialized and intersecting
        return hitbox1 && hitbox2 && (
            hitbox2.getX() + hitbox2.getWidth() > hitbox1.getX() &&
            hitbox1.getX() + hitbox1.getWidth() > hitbox2.getX() &&
            hitbox2.getY() + hitbox2.getHeight() > hitbox1.getY() && 
            hitbox1.getY() + hitbox1.getHeight() > hitbox2.getY()    
        );
    }

    /**@param {Hitbox} hitbox @returns {boolean}*/
    isColliding(hitbox){ return Hitbox.isColliding(this, hitbox); }

    /**
     * @param {Hitbox} hitbox1
     * @param {Hitbox} hitbox2
     * @returns {"bottom" | "top" | "right" | "left" | null}
     */
    static getCollidingSide(hitbox1, hitbox2){
        if(Hitbox.isColliding(hitbox1, hitbox2)) {
            if(hitbox1.getYWithHeight() >= hitbox2.getY() || hitbox1.getY() <= hitbox2.getYWithHeight()){}
            if(hitbox1.getXWithWidth() >= hitbox2.getX() && hitbox1.getX() < hitbox2.getX()){ return "right"; }
            if(hitbox2.getXWithWidth() >= hitbox1.getX() && hitbox2.getX() < hitbox1.getX()){ return "left"; }
            if(hitbox1.getYWithHeight() >= hitbox2.getY() && hitbox1.getY() < hitbox2.getY()){ return "bottom"; }
            if(hitbox2.getYWithHeight() >= hitbox1.getY() && hitbox2.getY() < hitbox1.getY()){ return "top"; }
        }
        return null;
    }

    /**
     * @param {Hitbox} hitbox1
     * @param {Hitbox} hitbox2
     * @returns {"bottom" | "top" | "right" | "left" | null}
     */
    static getHorizontalCollidingSide(hitbox1, hitbox2){
        if(Hitbox.isColliding(hitbox1, hitbox2)) {
            if(hitbox1.getXWithWidth() >= hitbox2.getX() && hitbox1.getX() < hitbox2.getX()){ return "right"; }
            if(hitbox2.getXWithWidth() >= hitbox1.getX() && hitbox2.getX() < hitbox1.getX()){ return "left"; }
            if(hitbox1.getYWithHeight() >= hitbox2.getY() && hitbox1.getY() < hitbox2.getY()){ return "bottom"; }
            if(hitbox2.getYWithHeight() >= hitbox1.getY() && hitbox2.getY() < hitbox1.getY()){ return "top"; }
        }
        return null;
    }

    /**
     * @param {Hitbox} hitbox1
     * @param {Hitbox} hitbox2
     * @returns {"bottom" | "top" | "right" | "left" | null}
     */
    static getVerticalCollidingSide(hitbox1, hitbox2){
        if(Hitbox.isColliding(hitbox1, hitbox2)) {
            if(hitbox1.getYWithHeight() >= hitbox2.getY() && hitbox1.getY() < hitbox2.getY()){ return "bottom"; }
            if(hitbox2.getYWithHeight() >= hitbox1.getY() && hitbox2.getY() < hitbox1.getY()){ return "top"; }
        }
        return null;
    }

    /**
     * 
     * @param {*} entity1 
     * @param {*} entity2 
     */
    static getEntityCollidingSide(entity1, entity2){

    }

    /**
     * @param {Hitbox} hitbox 
     * @returns {"bottom" | "top" | "right" | "left" | null}
     */
    getCollidingSide(hitbox){ return Hitbox.getCollidingSide(this, hitbox); }

    /**@param {number} xAdder @returns {void}*/
    addX(xAdder){ this.#x += xAdder; }

    /**@param {number} yAdder @returns {void}*/
    addY(yAdder){ this.#y += yAdder; }

    /**@param {number} x @returns {void}*/
    setX(x){ this.#x = x; }

    /**@param {number} y @returns {void}*/
    setY(y){ this.#y = y; }

    /**@param {number} width @returns {void}*/
    setWidth(width){ this.#width = width; }

    /**@param {number} height @returns {void}*/
    setHeight(height){ this.#height = height; }

    /**@param {number} offsetX @returns {void}*/
    setOffsetX(offsetX){ this.#offsetX = offsetX; }

    /**@param {number} offsetY @returns {void}*/
    setOffsetY(offsetY){ this.#offsetY = offsetY; }

    /**@param {number} x @returns {void}*/
    setCenterX(x) { this.#x = x - this.#width / 2; }

    /**@param {number} y @returns {void}*/
    setCenterY(y) { this.#y = y - this.#height / 2; }

    /**@param {number} x @returns {void}*/
    setXWithOffset(x) { this.#x = x + this.#offsetX; }

    /**@param {number} y @returns {void}*/
    setYWithOffset(y) { this.#y = y + this.#offsetY; }

    /**@returns {number}*/
    getX(){ return this.#x; }

    /**@returns {number}*/
    getY(){ return this.#y; }

    /**@returns {number}*/
    getWidth(){ return this.#width }

    /**@returns {number}*/
    getHeight(){ return this.#height }

    /**@returns {number}*/
    getOffsetX() { return this.#offsetX; }

    /**@returns {number}*/
    getOffsetY() { return this.#offsetY; }

    /**@returns {number}*/
    getCenterX(){ return this.#x + this.#width / 2 }

    /**@returns {number}*/
    getCenterY(){ return this.#y + this.#height / 2 }

    /**@returns {number}*/
    getXWithOffset() { return this.#x - this.#offsetX; }

    /**@returns {number}*/
    getYWithOffset() { return this.#y - this.#offsetY; }
    
    /**@returns {number}*/
    getXWithWidth(){ return this.#x + this.#width; }

    /**@returns {number}*/
    getYWithHeight(){ return this.#y + this.#height; }
    
}