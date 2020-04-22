import {degToRad,rotatePoint} from '../util/util'

module.exports = (lght)=> {
    lght.app.prototype.render = function(){
        this.clearCanvas();
        this.fillBackground();
        this.renderShape();
    }

    lght.app.prototype.visualInit = function(){
        this.backgroundColor = this.options.background;
        this.context = this.canvas.getContext("2d");
    }

    lght.app.prototype.renderShape = function(){
        this.renderPositions();

        this.objects.forEach(obj=>{
            if(obj.static) obj.drawPreloader();
            else obj.draw();
        })
    }

    //<-------------------BASIC CANVAS STUFF---------------------->
    //CLEARING CANVAS AND BACKGROUND COLOR
    lght.app.prototype.clearCanvas = function(){
        this.context.save(); 
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height); 
        this.context.restore();
    }

    lght.app.prototype.fillBackground = function(){
        if(this.backgroundColor!=='none'){
            this.context.save(); 
            this.context.fillStyle = this.backgroundColor;
            this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
            this.context.restore();
        }
    }

    /*POSITION INDICATOR FUNCTIONS GO HERE
    Draw all position indicators at once to save performance from context state change*/
    lght.app.prototype.renderPositions = ()=>{
        this.context.save();
        this.context.fillStyle = 'red';

        this.objects.forEach(({x,y}) => {
            this.context.beginPath()
            this.context.arc(x,y,5,0,2*Math.PI)
            this.context.closePath()
            this.context.fill()
        });
        
        this.context.restore();
    }


    /* SHAPE PRERENDERING FUNCTIONS GO HERE
    Shape prerendering prerender shapes on canvases to save performance*/

    lght.object.prototype.updateVisual = function(){
        //If the dimension changes a new canvas have to be created
        var max = this.findMax();
        for(var i = 0;i<max.length;i++){
            if(max[i]!==this.preloader.maxes[i]){
                this.createPreloader(); return;
            }
        }

        this.clearPreloader();

        this.shapes.forEach(s=>{
            let x = this.preloader.ox + s.x
            let y = this.preloader.oy + s.y
            lght.drawShape(this.preloader.context,x,y,s,)
        })
    }

    lght.object.prototype.clearPreloader = function(){
        this.preloader.context.clearRect(0,0,this.preloader.width,this.preloader.height);
    }

    lght.object.prototype.createPreloader = function(){
        if(this.static){
            this.preloader = document.createElement('canvas');
            
            this.preloader.maxes = this.findMax();

            this.preloader.width = this.width;
            this.preloader.height = this.height;

            this.preloader.ox = this.x - this.preloader.maxes[0];
            this.preloader.oy = this.y - this.preloader.maxes[2];


            this.preloader.context = this.preloader.getContext('2d');

            this.updateVisual();
        }
    }

    lght.object.prototype.drawPreloader = function(){
        if(this.preloader.width >0 && this.preloader.height > 0){
            let x = this.preloader.maxes[0] + this.preloader.width/2;
            let y = this.preloader.maxes[2] + this.preloader.height/2;
             x = Math.round(x); y = Math.round(y);

            lght.drawImg(this.parent.context,x,y,this.preloader,this.preloader.width,this.preloader.height,0,1);
        }
    }


    //<------------------SHAPE DRAWING FUNCTION---------------->
    lght.object.prototype.draw = function(){
        this.shapes.forEach(s=>{
            lght.drawShape(this.parent.context,this.x+s.x,this.y+s.y,s)
        })
    }

    //MASTER FUNCTION
    lght.drawShape = function(c,x,y,shape){
        if(shape.border || shape.borderOnly){
            this.drawShapeKind(c,shape,x,y,true,1,shape.borderColor);
        }
        if(!shape.borderOnly){
            this.drawShapeKind(c,shape,x,y,false,shape.opacity,shape.color);
        }
    }

    lght.drawShapeKind = function(c,s,x,y,stroke,opacity,color,points){
        opacity = s.opacity * opacity;
        x= Math.round(x); y = Math.round(y);

        switch(s.kind){
            case 'rect':
                lght.drawRect(c, x,y, color, s.w,s.h, s.rotation, stroke, s.borderWidth,opacity); break;
            case 'arc':
                lght.drawArc(c, x,y, color, s.rad,s.arcDegree,s.rotation, stroke,s.borderWidth,opacity); break;
            case 'text':
                lght.drawText(c, x,y, color,s.text,s.font, stroke,s.borderWidth, s.textAlign,opacity); break;
            case 'img':
                lght.drawImg(c, x,y, s.prite, s.w,s.h,s.rotation, opacity); break;
            default:
                break
        }
    }

    //DRAWING RECTANGLE
    lght.drawRect = function(c,x,y,color,w,h,rotation,stroke,lineWidth,o){
        c.save();

        c.globalAlpha = o;
        c.translate(x,y);
        c.rotate((360-rotation))

        if(stroke){
            c.strokeStyle = color; c.lineWidth = lineWidth;
            c.strokeRect(-w/2,-h/2,w,h);
        }
        else{
            c.fillStyle = color; 
            c.fillRect(-w/2,-h/2,w,h);
        } 
        c.restore();
    }

    //DRAWING CIRCLES
    lght.drawArc = function(c,x,y,color,rad,arcDegree,rotation,stroke,lineWidth,o){
        c.save();

        c.globalAlpha = o;
        c.translate(x,y);
        c.beginPath();

        var br = degToRad(360 - rotation - arcDegree);
        var er = degToRad(360 - rotation);

        if(arcDegree < 360){
        var pt = rotatePoint(0,0,rad,0,360-rotation-arcDegree);
        c.moveTo(pt[0],pt[1]); c.moveTo(0,0);
        }

        c.arc(0,0,rad,br,er);

        if(stroke){
            c.strokeStyle = color; c.lineWidth = lineWidth;
            c.stroke();
        }
        else{
            c.fillStyle = color;
            c.fill();
        }
        c.closePath();

        c.restore();
    }

    //DRAWING TEXT

    lght.drawText = function(c,x,y,color,text,font,stroke,lineWidth,textAlign,o){
        c.save();

        c.globalAlpha = o;
        c.textAlign = textAlign;
        c.font = font;
        if(stroke){
            c.strokeStyle = color; c.lineWidth = lineWidth;
            c.strokeText(text,x,y);
        }
        else{
            c.fillStyle = color;
            c.fillText(text,x,y);
        }

        c.restore();
    }

    //DRAWING IMAGES
    lght.drawImg = function(c,x,y,sprite,w,h,rotation,o){
        c.save();

        c.globalAlpha = o;
        c.translate(x,y);
        c.rotate(degToRad(360-rotation));

        c.drawImage(sprite,-w/2,-h/2,w,h);

        c.restore();
    }
    return lght
}