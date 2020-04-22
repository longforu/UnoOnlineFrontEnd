import {mergeDefaultPropertyObject} from '../util/util'

module.exports = (lght)=>{
    lght.apps = [];

    lght.gameloop = {
        list:[],
        frameTime:undefined,
        lastFrame:undefined
    };

    lght.gameloop.loop = (time)=>{
        requestAnimationFrame(lght.gameloop.loop);

        for(var i = 0;i<lght.gameloop.list.length;i++){
            lght.gameloop.list[i](lght.apps[i]);
        }
        
        if(time!==undefined){
            lght.lastFrame = lght.frameTime;
            lght.frameTime = time;
        }
    }

    lght.gameloop.loop();

    lght.app = function(elem,options) {

        this.options = {};
        mergeDefaultPropertyObject(options,lght.defaultAppConfig,this.options)        
        this.canvas = elem;
        this.initFunctions.forEach((e)=>this[e]())
        

        lght.gameloop.list.push((this.options.constantRender)?(obj)=>{
            obj.animateFunctions.forEach((e)=>obj[e]())
            return obj;
        }:()=>{})
        lght.apps.push(this);
    }

    lght.app.prototype.update = function(){
        this.objects.forEach(e => {
            if(typeof e.update === 'function') e.update(e)
        });
    }

    return lght
}

