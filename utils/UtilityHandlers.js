export class LinkedList {
    value;
    next;
    /**
     * @param {any} value 
     * @param {LinkedList | undefined} next 
     */
    constructor(value, next = null){
        this.value = value;
        this.next = next;
    }

    /**
     * @param {LinkedList} linkToDelete 
     * @param {LinkedList} previousLink 
     * @returns {void}
     */
    static deleteLink(linkToDelete, previousLink){
        if(previousLink !== null) { previousLink.next = linkToDelete?.next ?? null; }
        linkToDelete = null;
    }

    /**
     * @param {LinkedList} head 
     * @param {(link: any, index: number) => boolean} callbackfn 
     * @param {LinkedList} previousLink
     * @returns {void}
     */
    static filter(head, callbackfn, _previousLink = null){
        let previousLink = _previousLink, index = 0;
        while(head !== null){
            if(!callbackfn(head.value, index)) {
                LinkedList.deleteLink(head, previousLink);
            }
            previousLink = head;
            head = head.next;
            index++;
        }
    }

    /**
     * @param {LinkedList} head 
     * @param {(currentLinkedListToDelete: LinkedList, previousLink: LinkedList | null, index: number) => boolean} callbackfn 
     * @returns {boolean}
     */
    static findAndDelete(head, callbackfn){
        let previousLink = null, index = 0;
        while(head !== null && !callbackfn(head, previousLink, index)){
            previousLink = head;
            head = head.next;
            index++;
        }
        const success = head !== null;
        LinkedList.deleteLink(head, previousLink);
        return success;
    }

    /**
     * @param {LinkedList} head 
     * @param {(link: LinkedList, previousLink: LinkedList | null, index: number) => boolean} callbackfn 
     * @returns {LinkedList | null}
     */
        static findLink(head, callbackfn){
            let previousLink = null, index = 0;
            while(head !== null && !callbackfn(head, previousLink, index)){
                previousLink = head;
                head = head.next;
                index++;
            }
            return head;
        }

    /**
     * @param {LinkedList} head 
     * @param {(link: LinkedList, previousLink: LinkedList | null, index: number) => void} callbackfn 
     * @returns {void}
     */
    static forEachLinkedList(head, callbackfn){
        let previousLink = null, index = 0;
        while(head !== null){
            callbackfn(head, previousLink, index);
            previousLink = head;
            head = head.next;
            index++;
        }
    }

    /**
     * @param {LinkedList} head 
     * @param {(value: any, index: number, previousLink: LinkedList | null) => void} callbackfn 
     * @returns {void}
     */
    static forEachValue(head, callbackfn){
        let previousLink = null, index = 0;
        while(head !== null){
            callbackfn(head.value, index, previousLink);
            previousLink = head;
            head = head.next;
            index++;
        }
    }

    /**
     * @param {LinkedList} head 
     * @param {LinkedList} link 
     * @returns {void}
     */
    static insertLinkedList(head, link){
        if(head === null) { return; }

        const temp = head.next;
        head.next = link
        link.next = temp;
    }

    /**
     * @param {LinkedList} head 
     * @param {any} value 
     * @returns {void}
     */
    static insertValue(head, value){
        LinkedList.insertLinkedList(head, new LinkedList(value));
    }
}

//dwadaw
/**@abstract*/
export class Implementer {
    static thingy = class {
        static whosWho = "wait who are u?";
        constructor(){
            this.isAliveStill = "im still alive fr fr no cap home slice";
        }

        /**
         * @returns {string}
         */
        getIsAliveStill(){ return this.isAliveStill; }
    }
}