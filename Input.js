export default class InputHandler{
    #debug
    #gameIsPaused
    #vaildKeys
    keys = {up:false, down:false, right:false, left:false, space:false, attack:false};
    constructor(){
        this.#debug = false;
        this.#gameIsPaused = false;
        this.#vaildKeys = {'KeyW':'up', 'KeyS': 'down', 'KeyA':'left', 'KeyD':'right', 'ArrowUp':'up', 'ArrowDown': 'down', 'ArrowLeft':'left', 'ArrowRight':'right', 'Space':'space', 'KeyX':'attack'};

        window.addEventListener('keydown', ({ code }) => {
            if (this.#vaildKeys.hasOwnProperty(code)){
                const key = this.#vaildKeys[code];
                if(!this.keys[key]){
                    // if players pressing both left and right key at same time update moving direction
                    if(key === 'right' && this.keys.left){this.keys.left = false;}
                    else if(key === 'left' && this.keys.right){this.keys.right = false;};
                    this.keys[key] = true;
                }
            }else{//special keys
                switch(code){
                    case 'KeyR':
                        window.location.reload();
                        break;
                    case 'KeyF':
                        this.#debug = !this.#debug;
                        break;
                    case 'KeyP':
                        this.#gameIsPaused = !this.#gameIsPaused
                    break;
                }
            }
        });

        window.addEventListener('keyup', ({ code }) => {
            if (this.#vaildKeys.hasOwnProperty(code)){
                const key = this.#vaildKeys[code]
                if(this.keys[key]){
                    this.keys[key] = false;
                }
            }
        });
    }

    getDebug(){ return this.#debug; }

    getGameIsPaused(){ return this.#gameIsPaused; }

    getKeys() { return this.keys; }
}