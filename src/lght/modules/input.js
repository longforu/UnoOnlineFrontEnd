import {translateMouseCoor} from '../util/util'

module.exports = (lght)=>{    
    //<--------------KEYBOARD INPUT GO HERE------------------->
    lght.object.prototype.attachQuickMovement = (velocity,cooldown,func) => {
        var cd = true; var obj = this
        this.parent.canvas.addEventListener('keydown',function(key){
            if(cd){
                if(lght.inputReference.movementIndex.indexOf(key.key)!==-1){
                    obj.x += lght.inputReference.coeffIndex[lght.inputReference.movementIndex.indexOf(key.key)][0]*velocity;
                    obj.y += lght.inputReference.coeffIndex[lght.inputReference.movementIndex.indexOf(key.key)][1]*velocity;
                    obj.updateVisual();
                    if(func) func(key,obj);
                    cd = false; 
                    setTimeout(()=>{cd = true;},cooldown)
                }
            }
        })
    }

    //<--------------MOUSE INPUT GO HERE---------------------->

    //PRESS EVENT FOR AN APP
    lght.object.prototype.pressedEvent = (func) => {
        var object = this;
        this.parent.canvas.addEventListener('mouseup',function(e){
            var coor = translateMouseCoor(e);
            if(object.pointInObject(coor[0],coor[1])) func(object);
        })
    }

    //MAKE AN OBJECT DRAGGABLE
    lght.object.prototype.makeDraggable = (func) => {
        this.onDrag = false; var obj = this; this.draggable = true;
        var rx = 0; var ry = 0; 
        this.parent.canvas.addEventListener('mousedown',(e) => {
            var coor = translateMouseCoor(e);
            if(obj.draggable){
            if(obj.pointInObject(coor[0],coor[1])){
                if(!obj.onDrag){
                    obj.onDrag = true;
                    rx = coor[0] - obj.x; ry = coor[1] - obj.y;
                }
            }
            }
        })
        this.parent.canvas.addEventListener('mousemove', (e) => {
            var c = translateMouseCoor(e);
            if(obj.onDrag){
                obj.x = c[0] - rx; obj.y = c[1] - ry;
                obj.updateVisual();
                if(typeof func == 'function') func(obj);
            }
        })
        this.parent.canvas.addEventListener('mouseup', (e) => {
            if(obj.onDrag) obj.onDrag = false;
        })
    }

    //HOVER EVENT
    lght.object.prototype.hoverEvent = (funcin,funcout) => {
        this.mouseIn = false; var obj = this;
        this.parent.canvas.addEventListener('mousemove', (e)=>{
            var c = translateMouseCoor(e);
            var touch = obj.pointInObject(c[0],c[1]);
            if(obj.mouseIn && (!touch)){
                obj.mouseIn = false; if (funcout){funcout(obj);obj.updateVisual();};
            }
            if(!obj.mouseIn && touch){
                obj.mouseIn = true; if(funcin){funcin(obj);obj.updateVisual();};

            }
        })
    }
    return lght
}
