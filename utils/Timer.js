import { LinkedList } from "./UtilityHandlers.js";

export default class Timer {
    /**@type {LinkedList}*/static #timers = new LinkedList(null);

    /**
     * @returns {Timer[]}
     */
    static get timers(){
        return this.#timers;
    }

    static updateAll(deltatime){
        LinkedList.forEachValue(Timer.#timers.next, timer => timer.update(deltatime));
    }

    /**
     * @param {Timer} timer 
     * @returns {void}
     */
    static #addTimer(timer){
        LinkedList.insertValue(Timer.#timers, timer);
    }

    #duration;
    #updateInterval = 0;
    #isContinuous;
    #isActive = false;
    #callBack;

    /**
     * @param {number} duration 
     * @param {boolean} isContinuous 
     * @param {Function} callBack 
     */
    constructor(duration, isContinuous = false, callBack = () => {}){
        this.#duration = duration;
        this.#callBack = callBack;
        this.#isContinuous = isContinuous;
        Timer.#addTimer(this);
    }

    /**
     * @returns {void}
     */
    activate(){
        this.#isActive = true;
        this.#updateInterval = 0;
    }

    /**
     * @returns {void}
     */
    deActivate(){
        this.#isActive = false;
        this.#updateInterval = 0;
    }

    /**
     * @returns {boolean}
     */
    isActive(){
        return this.#isActive;
    }

    /**
     * @returns {number}
     */
    getDuration(){ return this.#duration; }

    /**
     * @param {boolean} isContinuous 
     * @returns {void}
     */
    setIsContinuous(isContinuous){ this.#isContinuous = isContinuous; }

    /**
     * @param {number} duration 
     * @returns {void}
     */
    setDuration(duration){ this.#duration = duration; }

    /**
     * @param {number} deltatime
     * @returns {void}
     */
    update(deltatime){
        this.#updateInterval += deltatime;
        if(this.#updateInterval >= this.#duration && (this.#isActive || this.#isContinuous)){
            this.deActivate();
            this.#callBack();
        }
    }
}

// class AnimationTimer extends Timer{

//     /**
//      * @param {number} duration 
//      * @param {boolean} isContinuous 
//      * @param {Function} callBack 
//      */
//     constructor(duration, isContinuous, callBack){
//         super(duration, isContinuous, callBack);
//     }

// }