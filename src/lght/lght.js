/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-vars */
//LIGHT LIBRARY IS DEVELOPED BY LONG TRAN
//COPYRIGHT 2020, ALL RIGHTS RESERVED

import {getByDotNotation, changeByDotNotation , mergeDefaultPropertyObject, findDistance2Point, findIntersection, rotatePoint, degToRad, findAngle2Point ,findClosestPoint, calculateRotatePoint, radToDeg, mobileCheck, cloneDeep, compareDifferentArray} from './modules/util.js'
import config from './modules/config.js'
import draw from './modules/draw.js'
import ease from './modules/ease.js'
import _ from 'lodash'
let lght = {};
  
//Main
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

lght.game = class{
    constructor(elem,option={}){
        this.divElement = elem
        this.layers = []
        this.elements = []
        this.doms = []
        mergeDefaultPropertyObject(option,config.defaultGameConfig,this)
        window.addEventListener('resize',()=>{if(!this.killed) this.layers.forEach((e,i)=>{
            e.canvas.width = this.divElement.clientWidth * this.pixelDensity
            e.canvas.height = this.divElement.clientHeight*this.pixelDensity
            if(!e.options.constantRender) e.refresh()
            e.drawEverything()
        })})
        this.addLayer({constantRender:false}).addLayer().addLayer({constantRender:false})
        if(option.backgroundColor) this.setBackground(option.backgroundColor)
        
    }
    removeLayer(index){this.layers.splice(index,1).kill()}
    addElement(option,index=this.elements.length){
        const element = new lght.element(option,this);
        this.doms.push(element)
        this.elements.splice(index,0,element.element)
        return element
    }
    addLayer(option,index = this.layers.length){
        let canvas = this.addElement({type:'canvas',style:{position:'absolute',width:'100%',height:'100%',left:'0px',top:'0px',backgroundColor:'transparent'}}).element
        canvas.width = this.divElement.clientWidth * this.pixelDensity
        canvas.height = this.divElement.clientHeight * this.pixelDensity
        let opt = {pixelDensity:this.pixelDensity}
        if(option) opt = {...opt,...option}
        this.layers.splice(index,0,new lght.app(canvas,opt,this.divElement))
        this.resetZIndex()
        return this
    }

    resetZIndex(){
        this.elements.forEach((e,i)=>{
            e.style.zIndex = e.zIndex || i
        })
    }

    loadLayer(layer,index = this.layers.length-1){
        
    }
    replaceAndLoad(index,layer){

    }
    kill(){
        this.killed = true
        this.layers.forEach(i=>i.kill())
        this.dom.forEeach(i=>i.kill())
    }
    setBackground = color=>{
        this.layers[0].backgroundColor = color
        this.layers[0].refresh()
    }
}

//layer is an object with 2 thing: the option for game, and the objects option of the app gameOption objectOption

lght.coordinate = class {
    constructor(option,element){
        mergeDefaultPropertyObject(option,config.defaultCoordinateConfig,this)
        this.coordinateElement = element;
    }
    translateToRealPixel = (num,extraInfo)=>{
        if(num.match(/%/)) return (parseInt(num.split('').filter(e=>e!=='%').join(''))/100) * extraInfo
        return parseInt(num)
    }
    get parentWidth(){
        return this.coordinateElement.width || this.coordinateElement.clientWidth
    }
    get parentHeight(){
        return this.coordinateElement.height || this.coordinateElement.clientHeight
    }
    get posX(){
        if(this.hook && typeof this.hookObject.posX === 'number') return this.hookObject.posX + this.x
        if(this.hook && typeof this.hookFunction().posX === 'number') return this.hookFunction().posX + this.x
        if(this.alignX){
            let base
            if(this.alignDirectionX === 'left') base = 0
            else if(this.alignDirectionX === 'right') base = this.parentWidth
            else base = this.parentWidth/2
            const coeff = (this.alignDirectionX === 'left' || this.alignDirectionX === 'center')?1:-1
            return base + coeff*(this.alignMarginX)
        }
        if(typeof this.x === 'number') return this.x
        const arr = this.x.split(' ')
        if(arr.length === 1) return this.translateToRealPixel(arr[0],this.parentWidth)
        else{
            let i = 0
            while(i<arr.length){
                if(arr[i] === '+' || arr[i] === '-'){
                    const coeff = (arr[i] === '+') ? 1 : -1
                    arr[i] = this.translateToRealPixel(arr.splice(i+1,1),this.parentWidth) + coeff*this.translateToRealPixel(arr.splice(i-1,1),this.parentWidth)
                }
                else i++
            }
        }
        return arr[0]
    }
    
    get posY(){
        if(this.hook && typeof this.hookObject.posY === 'number') return this.hookObject.posY + this.y
        if(this.hook && typeof this.hookFunction().posY === 'number') return this.hookFunction().posY + this.y
        if(this.alignY){
            let base
            if(this.alignDirectionY === 'top') base = 0
            else if(this.alignDirectionY==='bottom') base = this.parentHeight
            else base = this.parentHeight/2
            const coeff = (this.alignDirectionY==='top' || this.alignDirectionY==='center')?1:-1
            return base + coeff*( this.alignMarginY)
        }
        if(typeof this.y === 'number') return this.y
        const arr = this.y.split(' ')
        if(arr.length === 1) return this.translateToRealPixel(arr[0],this.parentHeight)
        else{
            let i = 0
            while(i<arr.length){
                if(arr[i] === '+' || arr[i] === '-'){
                    const coeff = (arr[i] === '+') ? 1 : -1
                    arr[i] = this.translateToRealPixel(arr.splice(i+1,1),this.parentHeight) + coeff*this.translateToRealPixel(arr.splice(i-1,1),this.parentHeight)
                }
                else i++
            }
        }
        return arr[0]
    }
}

lght.element = class extends lght.coordinate{
    constructor(option,parent){
        super(option,parent.divElement)
        mergeDefaultPropertyObject(option,config.defaultDomConfig,this)
        this.element = document.createElement(this.type)
        this.parent = parent
        this.style = {...config.defaultStyleConfig}
        if(option.style) for(let prop in option.style) (this.style[prop] = option.style[prop])
        this.parseStyle()
        this.parent.divElement.appendChild(this.element)
    }

    parseStyle(){
        this.element.style.left = `${this.posX}px`
        this.element.style.top = `${this.posY}px`
        for(let prop in this.style)(this.element.style[prop]=this.style[prop])
    }
    kill(){
        this.element.remove()
        const index = lght.gameloop.apps.indexOf(this)
        lght.gameloop.apps.splice(index,1)
        lght.gameloop.list.splice(index,1)
    }
    addAnimation(value,time,getter,setter,identifier,callback){
        if(identifier) while(this.animationIdentifier.findIndex((e,i)=>e===identifier&&this.animations[i]) !== -1) this.animations[this.animationIdentifier.findIndex((e,i)=>e===identifier&&this.animations[i])] = false
        this.animations.push(true)
        this.animationIdentifier.push(identifier)
        const id = this.animationCount
        this.animationCount++
        const change = (value - getter()) / (time / (1000/60))
        const iv = setInterval(()=>{
            if(this.killed || !this.animations[id]) return cancelEverything()
            const newValue = getter() + change
            if(change > 0 && newValue > value) return
            if(change < 0 && newValue < value) return
            setter(newValue)
        },1000/60)
        const to = setTimeout(()=>{
            if(this.killed || !this.animations[id]) return cancelEverything()
            setter(value)
            if (callback) callback()
            cancelEverything()
        },time)

        const cancelEverything = ()=>{
            clearTimeout(to)
            clearInterval(iv)
            this.animations[id] = false
        }
        return id;
    }
    cancelAnimation=(id)=>this.animations[id]=false
}

lght.app = function(elem,options,parentElement) {

    this.options = {};
    mergeDefaultPropertyObject(options,config.defaultAppConfig,this.options)        
    this.canvas = elem;
    this.eventElement= parentElement || this.canvas
    this.eventListeners = []
    this.eventListenersFunction = []
    this.options.initFunctions.forEach((e)=>this[e]())
    
    this.objects = []
    this.batchQueue = []
    this.initiated = false
    this.index = lght.gameloop.list.length
    lght.gameloop.list.push((this.options.constantRender || this.options.batchRender)?this.turnFunctions:()=>{})
    lght.apps.push(this);
}

lght.app.prototype.turnFunctions = (obj)=>{
    obj.options.animateFunctions.forEach((e)=>obj[e]())
}

lght.app.prototype.addEventListener =function(event,func){
    this.eventListeners.push(event)
    this.eventListenersFunction.push(func)
    this.eventElement.addEventListener(event,func)
}

lght.app.prototype.removeEventListenr = function(){
    this.eventListeners.forEach((e,i)=>this.eventElement.removeEventListener(e,this.eventListenersFunction[i]))
}

lght.app.prototype.kill = function(){
    this.objects.forEach(e=>{
        e.shapes.forEach(f=>f.kill())
        e.kill()
    })
    this.killed = true
    lght.gameloop.list.splice(this.index,1)
    lght.apps.splice(this.index,1)
    this.removeEventListenr()
}

lght.app.prototype.update = function(){
    this.objects.forEach(e => {
        if(typeof e.update === 'function') e.update(e)
    });
}

lght.app.prototype.translateMouseCoor = function(e){
	var x;
    var y;
	if (e.pageX || e.pageY) { 
		x = e.pageX;
		y = e.pageY;
	}
	else { 
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
        y=e.clientX + document.body.scrollTop + document.documentElement.scrollTop
    } 
    if(this.canvas.parentElement.scrollLeft && this.canvas.style.position !== 'fixed') x+=this.canvas.parentElement.scrollLeft
    if(this.canvas.parentElement.scrollTop && this.canvas.style.position !== 'fixed') x+=this.canvas.parentElement.scrollTop
	x -= this.canvas.offsetLeft;
	y -= this.canvas.offsetTop;
	return [x*this.options.pixelDensity,y*this.options.pixelDensity];
}

lght.app.prototype.refresh = function(){this.turnFunctions(this)}

//Object

//TOTAL OBJECT COUNT, USED TO PRODUCE ID
lght.objectCount = 0;

lght.object = class extends lght.coordinate{
    constructor(property,parent){
        super(property,parent.canvas)
        lght.objectCount++
        this.id = lght.objectCount;
        this.parent = parent;
        this.parent.objects.push(this)
        this.name = (property.objectName)?property.objectName:`Object ${this.id}`
        mergeDefaultPropertyObject
        (property,config.defaultObjectProps,this);    
        this.initFunctions.forEach((e)=>this[e]())
        this.initBehaviors.forEach(e=>this.activateBehavior(e))        
    }

    populateCacheSpecific(object,cachable,cacheDependencies){
        const getValueFromProp = prop=>(typeof this[prop]==='function')?this[prop]():this[prop]

        cachable.forEach((e)=>{
            let changed = false
            cacheDependencies.forEach(prop=>{
                let value = getValueFromProp(prop)
                if(value !== object[prop]){
                    object[prop] = value
                    changed = true
                }
            })
            
            if(changed) object[e] = getValueFromProp(e)
        })
    }

    populateCache(){
        if(!this.parent.shadowApp) return
        const object = this.parent.shadowApp.find(({name})=>name===this.name)
        if(!object) return
        //cachable cacheDependencies objectCachable objectCacheDependencies
        this.populateCacheSpecific(object,this.cachable,this.cacheDependencies)
        if(this.objectCachable) this.populateCacheSpecific(object,this.objectCachable,this.objectCacheDependencies)
        if(!object.shapes) object.shapes = this.shapes.map(({name})=>({name}))
        else object.shapes = object.shapes.filter(({name})=>this.shapes.find(e=>e.name===name))
        this.shapes.forEach((e,i)=>this.shapes[i].populateCache(object.shapes[i]))
    }

    getCache(property){
        if(!this.parent.shadowApp) return
        const object= this.parent.shadowApp.find(({name})=>name===this.name)
        return (object)?object[property]:false
    }

    changePosition(x,y){
        if(x){
            if(this.alignX){
                let coeff = (this.alignDirectionX === 'left' || this.alignDirectionX === 'center')?1:-1
                this.alignMarginX = x - coeff*this.posX
            }
            else this.x = x
        }
        if(y){
            if(this.alignY){
                let coeff = (this.alignDirectionY==='top' || this.alignDirectionY==='center')?1:-1
                this.alignMarginY = y - coeff*this.posY
            }
            else this.y = y
        }
        if(this.static) this.updateVisual()
    }

    get posX(){
        if(this.hook && typeof this.hookObject.posX === 'number') return this.hookObject.posX + this.x
        if(this.hook && typeof this.hookFunction().posX === 'number') return this.hookFunction().posX + this.x
        if(this.alignX){
            let base
            if(this.alignDirectionX === 'left') base = 0
            else if(this.alignDirectionX === 'right') base = this.parent.canvas.width
            else base = this.parent.canvas.width/2
            const coeff = (this.alignDirectionX === 'left' || this.alignDirectionX === 'center')?1:-1
            return base + coeff*(this.alignMarginX)
        }
        if(typeof this.x === 'number') return this.x
        const arr = this.x.split(' ')
        if(arr.length === 1) return this.translateToRealPixel(arr[0],this.parent.canvas.width)
        else{
            let i = 0
            while(i<arr.length){
                if(arr[i] === '+' || arr[i] === '-'){
                    const coeff = (arr[i] === '+') ? 1 : -1
                    arr[i] = this.translateToRealPixel(arr.splice(i+1,1),this.parent.canvas.width) + coeff*this.translateToRealPixel(arr.splice(i-1,1),this.parent.canvas.width)
                }
                else i++
            }
        }
        return arr[0]
    }
    
    get posY(){
        if(this.hook && typeof this.hookObject.posY === 'number') return this.hookObject.posY + this.y
        if(this.hook && typeof this.hookFunction().posY === 'number') return this.hookFunction().posY + this.y
        if(this.alignY){
            let base
            if(this.alignDirectionY === 'top') base = 0
            else if(this.alignDirectionY==='bottom') base = this.parent.canvas.height
            else base = this.parent.canvas.height/2
            const coeff = (this.alignDirectionY==='top' || this.alignDirectionY==='center')?1:-1
            return base + coeff*( this.alignMarginY)
        }
        if(typeof this.y === 'number') return this.y
        const arr = this.y.split(' ')
        if(arr.length === 1) return this.translateToRealPixel(arr[0],this.parent.canvas.height)
        else{
            let i = 0
            while(i<arr.length){
                if(arr[i] === '+' || arr[i] === '-'){
                    const coeff = (arr[i] === '+') ? 1 : -1
                    arr[i] = this.translateToRealPixel(arr.splice(i+1,1),this.parent.canvas.height) + coeff*this.translateToRealPixel(arr.splice(i-1,1),this.parent.canvas.height)
                }
                else i++
            }
        }
        return arr[0]
    }

    kill(){
        this.parent.objects.splice(this.parent.objects.indexOf(this),1)
    }

    collide(obj){
        for(let s1 of this.shapes){
            for (let s2 of obj.shapes){
                if(s1.collide(s2)) return true
            }
        }

        return false
    }

    pointInObject(x,y){
        for(let s1 of this.shapes){
           if(s1.pointInShape(x,y)) return true
        }
        return false
    }

    findMax(){
        let xs = []
        let ys = []
        this.shapes.forEach(s=>{
            let [minX,maxX,minY,maxY] = s.findMax()
            xs = [...xs,minX,maxX]
            ys = [...ys,minY,maxY]
        })
        return [Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)]
    }

    findThePositionThatIsRelativeToThisObjectFromAbsolutePosition(x,y){
        return [x-this.x,y-this.y]
    }

    get w(){
        return this.findMax()[1] - this.findMax()[0]
    }
    get h(){
        return this.findMax()[3] - this.findMax(2)
    }
}

lght.templateNames = []
lght.templates = []
lght.template = (name,func)=>{
    lght.templateNames.push(name)
    lght.templates.push(func)
}

lght.app.prototype.useTemplate = (name,model)=> lght.templates[lght.templateNames.indexOf(name)](model,this)

lght.storage = class extends lght.object{
    constructor(property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultStorageProps,this)
        this.storageShapes = []
        this.model = property.model || []
        this.elementFunction = property.elementFunction || null
        this.updateToModel()
    }
    get totalLength(){
        if(!this.model.length) return 0
        if(!this.elementFunction) return 0
        let shape
        switch(this.direction){
            case 'row-reverse':
            case 'row':
                shape = this.elementFunction(this.model[0],0)
                const w = shape.width
                shape.kill()
                return w*this.model.length + this.spacing*(this.model.length-1)
            case 'column-reverse':
            case 'column':
                shape = this.elementFunction(this.model[0],0)
                const h = shape.height
                shape.kill()
                return h*this.model.length + this.spacing*(this.model.length-1)
            default:
                return 0
        }
    }
    updateToModel(){
        let model =[...this.model]
        this.storageShapes.forEach(e=>{e.kill();})
        this.storageShapes = []
        if(!model.length) return
        if(!this.elementFunction) return
        let shape
        let totalLength
        switch(this.direction){
            case 'row-reverse':
                model.reverse()
            case 'row':
                shape = this.elementFunction(model[0],0)
                const w = shape.width
                shape.kill()
                totalLength = w*model.length + this.spacing*(model.length-1)
                const firstX = -totalLength/2 + 0.5*w + this.margin
                model.forEach((content,i)=>{
                    const shape = this.elementFunction(content,i)
                    this.storageShapes.push(shape)
                    shape.x = firstX + i*w + i*this.spacing
                })
                break;
            case 'column-reverse':
                model.reverse()
            case 'column':
                shape = this.elementFunction(model[0],0)
                const h = shape.height
                shape.kill()
                totalLength = h*model.length + this.spacing*(model.length-1)
                const firstY = -totalLength/2 + 0.5*h - this.margin
                model.forEach((content,i)=>{
                    const shape = this.elementFunction(content,i)
                    this.storageShapes.push(shape)
                    shape.y = firstY +( i*h) + (i*this.spacing)
                })
                break
            default:
                break;
        }
        this.updateVisual()
        return this
    }
}

lght.advanceStorage = class extends lght.storage{
    constructor(property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultAdvanceStorageProps,this)
        this.updateToModel()
    }

    updateToModel(){
        super.updateToModel()
        if(!this.backgroundFunction) return
        this.backgroundShape = this.backgroundFunction()
        let h,w
        if(this.direction.match(/column/)){
            h = this.totalLength
            w = Math.max(...this.storageShapes.map(e=>e.w))
        }
        else{
            w = this.totalLength
            h = Math.max(...this.storageShapes.map(e=>e.h))
        }
        this.backgroundShape.h = h + this.paddingBottom + this.paddingTop
        this.backgroundShape.w = w + this.paddingLeft + this.paddingRight
        this.backgroundShape.x += this.paddingRight - this.paddingLeft
        this.backgroundShape.y += this.paddingTop - this.paddingBottom
        this.shapes.splice(this.shapes.length-1,1)
        this.shapes.unshift(this.backgroundShape)
        this.updateVisual()
        return this
    }
}

lght.spriteLinkReference = []
lght.spriteImageReference = []
lght.funcLists = []
lght.directoryPreset = ''
lght.fileTypePreset = ''

lght.sprite = (link,func)=> {
    const index = lght.spriteLinkReference.indexOf(link)
    if(index !== -1){
        const image = lght.spriteImageReference[index]
        lght.funcLists[index].push(func)
        if(image.complete) requestAnimationFrame(func)
        return image
    }
    else{
        const image = new Image()
        const id = lght.spriteImageReference.length
        image.onload = ()=>{
            lght.funcLists[id].forEach(e=>e())
        }
        lght.funcLists[id] = []
        lght.funcLists[id].push(func)
        image.src = `${lght.directoryPreset}${link}${lght.fileTypePreset}`
        lght.spriteLinkReference.push(link)
        lght.spriteImageReference.push(image)
        return image
    }
}

lght.awaitImage = url => new Promise(r=>{
    const image = lght.sprite(url,()=>{r(image)})
  })

lght.sound = class{
    constructor(link,loop){
        this.elem = document.createElement('audio')
        this.elem.oncanplaythrough = ()=>{
            this.loaded = true
            this.updateQueue()
        }
        this.elem.loop = loop
        this.elem.volume = 0.2
        this.elem.src = link
        this.elem.setAttribute('preload','auto')
        this.elem.setAttribute('controls','none')
        this.elem.style.display = 'none'
        document.body.appendChild(this.elem)
        this.queue = 1
        this.running = false
        this.loaded = false
    }
    updateQueue(){
        if(!this.running && this.queue && this.loaded && !lght.mute){
            this.running = true
            this.elem.play()
            setTimeout(()=>{
                this.running = false
                this.updateQueue()
            },this.elem.duration + 300)
            this.queue--
        }
    }
    addToQueue(){
        this.queue++
        this.updateQueue()
    }
}

lght.audioReference = []
lght.audioLinkReference = []
lght.playSound = (src,loop)=>{
    if(lght.audioLinkReference.indexOf(src)<0){
        const sound = new lght.sound(src,loop)
        lght.audioReference.push(sound)
        lght.audioLinkReference.push(sound)
    }
    else lght.audioReference[lght.audioLinkReference.indexOf(src)].addToQueue()
}
lght.stopAll = ()=>{
    Array.from(document.getElementsByTagName('audio')).forEach(e=>{
        e.pause()
    })
}
lght.muteAll = ()=>{
    lght.mute = true
    lght.stopAll()
    Array.from(document.getElementsByTagName('audio')).forEach(e=>e.mute=true)
}
lght.unmuteAll = ()=>{
    lght.mute = false
    lght.stopAll()
    Array.from(document.getElementsByTagName('audio')).forEach(e=>e.mute=false)
    lght.audioReference.forEach(e=>{if(e.elem.loop) e.addToQueue()})
}

lght.component = class {
    constructor(object){
        if(!lght.components) lght.components = {}
        if(!object.name) throw Error("Component must have name")
        lght.components[object.name] = object
    }
    static addComponent(name,property={},object){
        let option = {...lght.components[name]}
        for(let prop in property)(option[prop] = property[prop])
        return new lght[option.kind](option,object)
    }
}

lght.addComponent = (property) => new lght.component(property)

lght.classes = {}
lght.addClass = (name,options)=>lght.classes[name] = options

let shapeCount = 0
lght.shape = class {
    constructor (property,parent) {
        if(property.class) for(let className of property.class.split(' ')) for(let attr in lght.classes[className] || {}){
            if(property.importantAttr) if(property.importantAttr.split(' ').includes(attr)) continue
            property[attr] = lght.classes[className][attr]
        }
        this.kind = property.kind
        this.parent = parent;
        this.parent.shapes.push(this);
        mergeDefaultPropertyObject
        (property,config.defaultShapeOptions,this); 
        this.initBehaviors.forEach(e=>this.activateBehavior(e)) 
        this.name = property.name || `Shape${shapeCount++}`       
    }

    populateCacheSpecific(object,cachable,cacheDependencies){
        const getValueFromProp = prop=>(typeof this[prop]==='function')?this[prop]():this[prop]

        cachable.forEach((e)=>{
            let changed = false
            cacheDependencies.forEach(prop=>{
                let value = getValueFromProp(prop)
                if(value !== object[prop]){
                    object[prop] = value
                    changed = true
                }
            })
            
            if(changed) object[e] = getValueFromProp(e)
        })
    }

    populateCache(object){
        this.populateCacheSpecific(object,this.cachable,this.shapeCachable)
        if(this.shapeCachable) this.populateCacheSpecific(object,this.shapeCachable,this.shapeCacheDependencies)
    }

    getCache = (property)=>{
        if(!this.parent.parent.shadowApp) return
        const object = this.parent.parent.shadowApp.find(({name})=>name===this.parent.name)
        if(!object || !object.shapes) return false
        const shape = object.shapes.find(({name})=>name===this.name)
        if(!shape) return false
        return shape[property]
    }

    kill (){
        const index = this.parent.shapes.indexOf(this)
        if(index<0) return
        this.parent.shapes.splice(index,1);
        this.parent.updateVisual()
    }

    get absoluteX(){
        return (this.x*this.trueScale*this.scaleX + this.parent.posX)
    }

    get absoluteY(){
        return (this.y*this.trueScale*this.scaleY + this.parent.posY)
    }

    get hasBorder(){
        return this.border||this.borderOnly
    }

    get width(){
        return (((this.hasBorder)?(this.w + this.borderWidth):this.w))*this.trueScale*this.scaleX
    }

    get height(){
        return ((this.hasBorder)?this.h + this.borderWidth:this.h)*this.trueScale*this.scaleY
    }

    get trueScale(){return this.aScale*this.parent.scale}

    get outOfBound(){
        let [minX,maxX,minY,maxY] = this.findMax();
        let {width,height} = this.parent.parent.canvas;
        return (minX > width || maxX < 0 || minY > height || maxY < 0) 
    }

    findVertex(){
        return []
    }

    findMax(){
        const vertex = this.findVertex()
        const xs = []
        const ys = []

        vertex.forEach(([x,y])=>{
            xs.push(x); ys.push(y)
        })

        let offsetMinX = - this.borderWidthIfBorderIsOn 
        let offsetMaxX = this.borderWidthIfBorderIsOn 
        let offsetMinY = - this.borderWidthIfBorderIsOn 
        let offsetMaxY = this.borderWidthIfBorderIsOn 

        if(this.shadow){
            let shadowOffsetMinX = -this.shadow.blur -2
            let shadowOffsetMaxX = this.shadow.blur + 2
            let shadowOffsetMinY = -this.shadow.blur -2
            let shadowOffsetMaxY = this.shadow.blur +2
            if(this.shadow.offsetX){
                shadowOffsetMinX += this.shadow.offsetX
                shadowOffsetMaxX += this.shadow.offsetX
            }
            if(this.shadow.offsetY){
                shadowOffsetMinY += this.shadow.offsetY
                shadowOffsetMaxY += this.shadow.offsetY
            }
            if(shadowOffsetMinX<0) offsetMinX += shadowOffsetMinX
            if(shadowOffsetMaxX>0) offsetMaxX += shadowOffsetMaxX
            if(shadowOffsetMinY<0) offsetMinY += shadowOffsetMinY
            if(shadowOffsetMaxY>0) offsetMaxY += shadowOffsetMaxY
        }

        return [
            Math.min(...xs) + offsetMinX,
            Math.max(...xs) + offsetMaxX,
            Math.min(...ys) + offsetMinY,
            Math.max(...ys) + offsetMaxY
        ]
    }

    get borderWidthIfBorderIsOn(){
        if(this.border||this.borderOnly) return this.borderWidth
        return 0
    }

    pointInShape(x,y){
        let sides = this.findSides()
        const [minX,maxX,minY,maxY] = this.findMax()
        let distance = findDistance2Point(x,y,maxX,maxY)
        let compareSide = [x,y,x+distance,y]
        let intersect = 0
        if(x>maxX||x<minX||y>maxY||y<minY) return false
        sides.forEach(e=>{
            if(findIntersection(e,compareSide)) intersect++
        })
        return !(intersect%2 === 0)
    }

    findSides(){
        let vertex = this.findVertex()
        let result = []
        for(let i = 0;i<vertex.length;i++){
            result.push([...vertex[i],...((vertex[i+1])?vertex[i+1]:vertex[0])])
        }
        return result
    }

    collide(shape){
        if(shape.kind==='arc') return shape.collide(this)
        let [maxX1,minX1,maxY1,minY1] = this.findMax()
        let [maxX2,minX2,maxY2,minY2] = shape.findMax()
        if (((minX1 < minX2) && (maxX1 > maxX2) && (minY1<minY2) && (maxY1>maxY2)) || ((minX2 < minX1) && (maxX2 > maxX1) && (minY2<minY1) && (maxY2>maxY1))) return true

        let side1 = this.findSides()
        let side2 = shape.findSides()

        for (let s1 of side1){
            for (let s2 of side2){
                if(findIntersection(s1,s2)) return true
            }
        }
        return false
    }
}

lght.rect = class extends lght.shape{
    constructor (property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultRectOptions,this)
    }

    findVertex(){
        let reference = [[1,-1],[-1,-1],[-1,1],[1,1]]
        let result = []
        reference.forEach(([rx,ry])=>{
            let nx = this.absoluteX + 0.5*this.width*rx
            let ny = this.absoluteY + 0.5*this.height*ry
            result.push(rotatePoint(this.absoluteX,this.absoluteY,nx,ny,this.rotation))
        })
        return result
    }
    findMidpoint(){
        let reference = [[0,-1],[-1,0],[0,1],[1,0]]
        let result = []
        reference.forEach(([rx,ry])=>{
            let nx = this.absoluteX + 0.5*this.width*rx
            let ny = this.absoluteY + 0.5*this.height*ry
            result.push(rotatePoint(this.absoluteX,this.absoluteY,nx,ny,this.rotation))
        })
        return result
    }
}

lght.arc = class extends lght.shape{
    constructor (property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultArcOptions,this)
    }

    get radius(){
        return ((this.hasBorder)?this.rad + this.borderWidth : this.rad)*this.trueScale
    }

    get minAngle(){
        return this.rotation
    }

    get maxAngle(){
        return this.rotation + this.arcDegree
    }

    get minRadAngle(){
        return degToRad(this.minAngle)
    }

    get maxRadAngle(){
        return degToRad(this.maxAngle)
    }

    get pureCircle(){
        return this.arcDegree===360
    }

    pointInShape(x,y){
        var angle = findAngle2Point(this.absoluteX,this.absoluteY,x,y)
        if (angle>this.minAngle && angle<this.maxAngle){
            if(findDistance2Point(this.absoluteX,this.absoluteY,x,y)<=this.radius) return true
        }
        return false
    }

    findMax(){
        let result = [this.absoluteX-this.radius,this.absoluteX+this.radius,this.absoluteY-this.radius,this.absoluteY+this.radius]
        let xs = [this.absoluteX,this.absoluteX+Math.cos(this.minRadAngle)*this.radius,this.absoluteX+Math.cos(this.maxRadAngle)*this.radius]
        let ys = [this.absoluteY,this.absoluteY-Math.sin(this.minRadAngle)*this.radius,this.absoluteY-Math.sin(this.maxRadAngle)*this.radius]
        if(!this.pointInShape(result[0],this.absoluteY)) result[0] = Math.min(...xs) - this.borderWidthIfBorderIsOn/2;
        if(!this.pointInShape(result[1],this.absoluteY)) result[1] = Math.max(...xs) + this.borderWidthIfBorderIsOn/2;
        if(!this.pointInShape(this.absoluteX,result[2])) result[2] = Math.min(...ys) - this.borderWidthIfBorderIsOn/2;
        if(!this.pointInShape(this.absoluteX,result[3])) result[3] = Math.max(...ys) + this.borderWidthIfBorderIsOn/2;
        return result
    }

    findVertex(){
        let [minX,maxX,minY,maxY] = this.findMax()
        let referenceX = [this.absoluteX+Math.cos(this.minRadAngle)*this.radius,this.absoluteX+Math.cos(this.maxRadAngle)*this.radius,this.absoluteX+this.radius,this.absoluteX-this.radius,this.absoluteX]
        let referenceY = [this.absoluteY-Math.sin(this.minRadAngle)*this.radius,this.absoluteY-Math.sin(this.maxRadAngle)*this.radius,this.absoluteY+this.radius,this.absoluteY-this.radius,this.absoluteY]

        return [
            [minX,referenceY[referenceX.indexOf(minX)]],
            [maxX,referenceY[referenceX.indexOf(maxX)]],
            [referenceX[referenceY.indexOf(minY)],minY],
            [referenceX[referenceY.indexOf(maxY)],maxY],
        ]
    }

    findSides(){
        if(this.arcDegree === 360) return false
        return [
            [this.absoluteX,this.absoluteY,this.absoluteX+Math.cos(this.minRadAngle)*this.radius,this.absoluteY-Math.sin(this.minRadAngle)*this.radius],
            [this.absoluteX,this.absoluteY,this.absoluteX+Math.cos(this.maxRadAngle)*this.radius,this.absoluteY-Math.sin(this.maxRadAngle)*this.radius]
        ]
    }

    collide(shape){
        let vertex1 = this.findVertex()
        let vertex2 = shape.findVertex()

        for(let [x,y] of vertex1){
            if(shape.pointInShape(x,y)) return true
        }
        for(let [x,y] of vertex2){
            if(this.pointInShape(x,y)) return true
        }
        if(shape.kind==='arc'){                
            //when checking for intersection between 2 arcs, there are 2 cases
            //Case 1: they are both circles. In this case the distance between the 2 center have to be smaller or equal to
            //sum of radius for them to intersect

            if(this.pureCircle && shape.pureCircle){
                return findDistance2Point(this.absoluteX,this.absoluteY,shape.absoluteX,shape.absoluteY) <= this.radius + shape.radius
            }

            //Case 2: either of them are arcs
            //In these cases, there are 2 scenarios
            //Scenario 1: one of the vertexes will be inside the circle, this is easy to check
            //Scenario 2: none of the vertex is inside the circle. There is only one possible explanation for this. In this case, check if 
            //the "ray" that connect the 2 center is inside both arcs, then check that the length of the ray is less than the length of both radius

            if(findDistance2Point(this.absoluteX,this.absoluteY,shape.absoluteX,shape.absoluteY) > this.radius + shape.radius) return false

            let ray1 = findAngle2Point(this.absoluteX,this.absoluteY,shape.absoluteX,shape.absoluteY)
            let ray2 = findAngle2Point(shape.absoluteX,shape.absoluteY,this.absoluteX,this.absoluteY)
            return ((ray1<this.maxAngle&&ray1>this.minAngle)&&(ray2<shape.maxAngle&&ray2>shape.minAngle))
        }
        else{
            let side = shape.findSides()

            for(let s of side){
                let closest = findClosestPoint(this.absoluteX,this.absoluteY,s)
                if(closest){
                    if (this.pointInShape(closest[0],closest[1])) return true
                }
            }
            return false
        }
    }
}

lght.roundedRectangle = class extends lght.rect{
    constructor(property,parent){
        super(property,parent)
        this.borderRadius = (property.borderRadius*this.trueScale) || 0
        if(this.clip){
            if(property.clipCanvas){
                this.clipImage = property.clipCanvas;
                this.clipCanvas=true
            }
            else{
                this.clipImage = lght.sprite(this.clipImageLink,()=>{
                    this.parent.updateVisual()
                })
            }
        }
    }

    get clipImageLoaded(){
        if(!this.clip) return false
        if(this.clipCanvas) return true
        return this.clipImage.complete
    }

    changeClipImage(imageUrl){
        this.clipImage = lght.sprite(imageUrl,()=>{
            this.parent.updateVisual()
        })
    }
}

lght.poly = class extends lght.shape{
    constructor(property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultPolyOptions,this)
        if(this.clip){
            this.clipImage = lght.sprite(this.clipImageLink,()=>{
                this.parent.updateVisual()
            })
        }
    }

    get clipImageLoaded(){
        if(!this.clip) return false
        return this.clipImage.complete
    }

    get polyPoints(){
        let result = []
        if(!this.specialPolygon) result = this.points
        else{
        const radiusCoefficient = 360/this.numberOfSide
        for(let i = 0;i<this.numberOfSide;i++){
            result.push(calculateRotatePoint(0,0,radiusCoefficient*i,this.radius))
        }
        }
        const angleArray = result.map(([x,y])=>findAngle2Point(this.x,this.y,x,y))
        const distanceArray = result.map(([x,y])=>findDistance2Point(this.x,this.y,x,y)*this.trueScale)
        return angleArray.map((angle,i)=>calculateRotatePoint(this.x,this.y,angle,distanceArray[i]))
    }  

    get width(){
        return this.findMax()[1] - this.findMax()[0]
    }

    get height(){
        return this.findMax()[3] - this.findMax()[2]
    }

    get sideLength(){
        if(!this.specialPolygon) return null
        const radiusCoefficient = degToRad(360/this.numberOfSide)
        return Math.sqrt(2*Math.pow(this.radius,2) - 2*Math.pow(this.radius,2)*Math.cos(radiusCoefficient))
    }

    findVertex(){
        return this.polyPoints.map(([x,y])=>rotatePoint(this.absoluteX,this.absoluteY,x+this.absoluteX,y+this.absoluteY,this.rotation))
    }
}

lght.line = class extends lght.shape{
    constructor(property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultLineOptions,this)
    }

    get rotatedPoints(){
        const result =  this.points.map(([x,y])=>(rotatePoint(this.absoluteX,this.absoluteY,x+this.absoluteX,y+this.absoluteY,this.rotation)))
        const angleArray = result.map(([x,y])=>findAngle2Point(this.absoluteX,this.absoluteY,x,y))
        const distanceArray = result.map(([x,y])=>findDistance2Point(this.absoluteX,this.absoluteY,x,y)*this.trueScale)
        return angleArray.map((angle,i)=>calculateRotatePoint(this.absoluteX,this.absoluteY,angle,distanceArray[i]))
    }

    findVertex(){
        const result = []
        const notIncluded = ([x,y]) => {
            for (const position of result) {
                const [x2,y2] = position
                if(~~ (x + 0.5)===~~ (x2+ 0.5) && ~~ (y + 0.5)===~~ (y2+0.5)) return false
            }
            return true
        }
        const point = [...this.rotatedPoints]
        point.forEach(([x1,y1],index)=>{
            if (index===point.length-1) return
            const [x2,y2] = this.rotatedPoints[index+1]
            const distance = findDistance2Point(x1,y1,x2,y2)
            const tan = Math.atan((this.lineWidth/2)/distance)
            const angle = findAngle2Point(x1,y1,x2,y2)
            const angleQuadrant = radToDeg(tan)+angle
            const firstDistance = Math.sqrt(distance*distance + (0.5*this.lineWidth)*(0.5*this.lineWidth))
            const pointOneInFirstQuadrant = calculateRotatePoint(x1,y1,angleQuadrant,firstDistance)
            const pointSecondInSecondQuadrant = calculateRotatePoint(...pointOneInFirstQuadrant,180+angle,distance)
            const pointThreeInThirdQuadrant = calculateRotatePoint(...pointSecondInSecondQuadrant,270+angle,distance)
            const pointFourInFourthQuadrant = calculateRotatePoint(...pointThreeInThirdQuadrant,angle,distance)
            if(notIncluded(pointFourInFourthQuadrant)) result.push(pointFourInFourthQuadrant)
            if(notIncluded(pointOneInFirstQuadrant)) result.push(pointOneInFirstQuadrant)
            if(notIncluded(pointSecondInSecondQuadrant)) result.push(pointSecondInSecondQuadrant)
            if(notIncluded(pointThreeInThirdQuadrant)) result.push(pointThreeInThirdQuadrant)
        })
        return result
    }
}

lght.text = class extends lght.shape{
    constructor (property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultTextOptions,this)
        if(property.font) this.fontBackwardCompatibility = property.font
    }
    
    get font(){
        return this.fontBackwardCompatibility || `${this.fontSize*this.trueScale}px ${this.fontFamily}`
    }

    get textSize(){
        const cache = this.getCache('textSize')
        if(cache) return cache
        var c = lght.apps[0].context;
        c.save();
        c.font = this.font;
        var width = c.measureText(this.text).width;
        var height = c.measureText('gM').width;
        c.restore();
        return [width*this.trueScale,height*this.trueScale];
    }

    get w(){
        return this.textSize[0] + this.borderWidthIfBorderIsOn
    }

    get h(){
        return this.textSize[1] + this.borderWidthIfBorderIsOn
    }

    findVertex(){
        let reference
        let coefficient = 1
        if(this.textAlign === 'center') reference = [[1,-1],[-1,-1],[-1,0.8],[1,0.8]]
        else{
            if(this.textAlign === 'right') coefficient = -1
            reference = [[2,-1],[0,-1],[0,0.8],[2,0.8]].map(e=>[e[0]*coefficient,e[1]])
        }
        let result = []
        reference.forEach(([rx,ry])=>{
            let nx = this.absoluteX + 0.5*this.width*rx
            let ny = this.absoluteY + 0.5*this.height*ry
            result.push(rotatePoint(this.absoluteX,this.absoluteY,nx,ny,this.rotation))
        })
        return result
    }
}

lght.img = class extends lght.shape{
    constructor (property,parent){
        super(property,parent)
        mergeDefaultPropertyObject(property,config.defaultImgOptions,this)
        this.sprite = lght.sprite(this.spriteLink,()=>{
            if(this.loadedFunction) this.loadedFunction()
            this.parent.updateVisual()
        })
    }

    get imageLoaded(){
        return this.sprite.complete
    }

    get w(){
        if(this.drawWidth) return this.drawWidth
        if(this.imageLoaded){
            if(this.drawHeight) return (this.drawHeight*this.sprite.width)/this.sprite.height
            return this.sprite.width
        }
        return 0
    }

    get h(){
        if(this.drawHeight) return this.drawHeight
        if(this.imageLoaded){
            if(this.drawWidth) return (this.drawWidth*this.sprite.height)/this.sprite.width
            return this.sprite.height
        }
        return 0 
    }

    findVertex(){
        let reference = [[1,-1],[-1,-1],[-1,1],[1,1]]
        let result = []
        reference.forEach(([rx,ry])=>{
            let nx = this.absoluteX + 0.5*this.width*rx
            let ny = this.absoluteY + 0.5*this.height*ry
            result.push(rotatePoint(this.absoluteX,this.absoluteY,nx,ny,this.rotation))
        })
        return result
    }
}

//Input
 //<--------------KEYBOARD INPUT GO HERE------------------->
 lght.object.prototype.attachQuickMovement = function (velocity,cooldown,func) {
    var cd = true; var obj = this
    document.addEventListener('keydown',function(key){
        if(cd){
            if(config.inputReference.movementIndex.indexOf(key.key)!==-1){
                obj.x += config.inputReference.coeffIndex[config.inputReference.movementIndex.indexOf(key.key)][0]*velocity;
                obj.y += config.inputReference.coeffIndex[config.inputReference.movementIndex.indexOf(key.key)][1]*velocity;
                obj.updateVisual();
                if(func) func(key,obj);
                cd = false; 
                setTimeout(()=>{cd = true;},cooldown)
            }
        }
    })
    return this
}

//<--------------MOUSE INPUT GO HERE---------------------->

lght.app.prototype.startCursor = function(){
    this.eventElement.style.cursor = 'pointer'
}

lght.app.prototype.endCursor = function(){
    this.eventElement.style.cursor = 'default'
}

lght.object.prototype.enterCursorEvent = function(){
    if(this.alreadyCursorEvent) return
    this.alreadyCursorEvent = true
    this.hoverEvent(()=>this.parent.startCursor(),()=>this.parent.endCursor())
}

lght.shape.prototype.enterCursorEvent = function(){
    if(this.alreadyCursorEvent) return
    this.alreadyCursorEvent = true
    this.hoverEvent(()=>this.parent.parent.startCursor(),()=>this.parent.parent.endCursor())
}

lght.app.prototype.attachEvent = function(event,func){
    const mobile = mobileCheck()
    let trueEvent = event
    if(mobile){
        switch(trueEvent){
            case 'mousedown':
                trueEvent = 'touchstart'
                break
            case 'mouseup':
                trueEvent='touchend'
                break
            case 'mousemove':
                trueEvent='touchmove'
                break
            default:
                break;
        }
    }
    this.addEventListener(trueEvent,(e)=>{
        if(this.killed) return 
        if(mobileCheck()){
            Array.from(e.changedTouches).forEach(touch=>{
                const [x,y] = this.translateMouseCoor(touch)
                func(x,y)
            })
            return
        }
        const [x,y] = this.translateMouseCoor(e)
        func(x,y)
    })
}

lght.app.prototype.mouseInputInit = function(){
    const handleCoor = (x,y,event)=>{
        if(this.objects.length === 0) return
        for (let i = this.objects.length;i--;i>=0){
            const obj = this.objects[i]
            if(obj[event].length === 0) continue
            if(!obj.display) continue

            if(obj.pointInObject(x,y)){
                for(let func of obj[event])( func(x,y))
                break;
            }
        }
        LargeLoop:for (let i = this.objects.length;i--;i>=0){
            const obj = this.objects[i]
            if(obj.shapes.length === 0) continue
            if(!obj.display) continue
            for(let a = obj.shapes.length;a--;a>=0){
                const shape = obj.shapes[a]
                if(shape[event].length === 0) continue
                if(!shape.display) continue
                if(shape.pointInShape(x,y)){
                    for(let func of shape[event]){func(x,y)}
                    break LargeLoop;
                }
            }
        }
    }

    this.attachEvent('mouseup',(x,y)=>handleCoor(x,y,'mouseUpEvent'))
    this.attachEvent('mousemove',(x,y)=>handleCoor(x,y,'mouseMoveEvent'))
    this.attachEvent('mousedown',(x,y)=>handleCoor(x,y,'mouseDownEvent'))
}

//PRESS EVENT FOR AN APP
lght.object.prototype.pressedEvent = function (func) {
    this.enterCursorEvent()
    this.mouseUpEvent.push(func)
    return this
}

//MAKE AN OBJECT DRAGGABLE
lght.object.prototype.makeDraggable = function (func,funcDone) {
    this.enterCursorEvent()
    this.onDrag = false; var obj = this; this.draggable = true;
    var rx = 0; var ry = 0; 

    this.mouseDownEvent.push((x,y)=>{
        if(obj.draggable){
            if(!obj.onDrag){
                obj.onDrag = true;
                rx = x - obj.posX; ry = y - obj.posY;
            }
        }
    })

    this.parent.attachEvent('mousemove', (...c) => {
        if(c[0] < 0 || c[0] >this.parent.canvas.width || c[1] < 0 || c[1] > this.parent.canvas.height) obj.onDrag = false
        if(obj.onDrag){
            console.log(performance.now())
            this.changePosition(c[0] - rx,c[1] - ry)
            if(typeof func == 'function') func(obj);
        }
    })

    this.parent.attachEvent('mouseup', (e) => {
        if(obj.onDrag){
            obj.onDrag = false;
            if(funcDone) funcDone()
        }
    })
    return this
}

//HOVER EVENT
lght.object.prototype.hoverEvent = function (funcin,funcout)  {
    this.mouseIn = false; var obj = this;
    this.hoverEvents.push([funcin,funcout])
    if(this.hoverEvents.length === 1){
        this.enterCursorEvent()
        this.parent.attachEvent('mousemove', (...c)=>{
            if(c[0] < 0 || c[0] >this.parent.canvas.width || c[1] < 0 || c[1] > this.parent.canvas.height){
                obj.mouseIn = false;
                for(let event of this.hoverEvents){
                    if(event[1]) event[1]() 
                }
                return;
            }
            var touch = obj.pointInObject(c[0],c[1]);
            if(obj.mouseIn && (!touch)){
                obj.mouseIn = false; 
                for(let event of this.hoverEvents){
                    if(event[1]) event[1]() 
                }
            }
            
        })
        this.mouseMoveEvent.push(()=>{
            if(!obj.mouseIn){
                obj.mouseIn = true;
                for(let event of this.hoverEvents){
                    if(event[0]) event[0]() 
                }
            }
        })
    }
    return this
}

//INPUT FOR SHAPES
lght.object.prototype.attachQuickMovement = function (velocity,cooldown,func) {
    var cd = true; var obj = this
    document.addEventListener('keydown',function(key){
        if(cd){
            if(config.inputReference.movementIndex.indexOf(key.key)!==-1){
                obj.x += config.inputReference.coeffIndex[config.inputReference.movementIndex.indexOf(key.key)][0]*velocity;
                obj.y += config.inputReference.coeffIndex[config.inputReference.movementIndex.indexOf(key.key)][1]*velocity;
                obj.updateVisual();
                if(func) func(key,obj);
                cd = false; 
                setTimeout(()=>{cd = true;},cooldown)
            }
        }
    })
    return this
}

//<--------------MOUSE INPUT GO HERE---------------------->

//PRESS EVENT FOR AN APP
lght.shape.prototype.pressedEvent = function (func) {
    this.enterCursorEvent()
    this.mouseUpEvent.push(func)
    return this
}

//HOVER EVENT
lght.shape.prototype.hoverEvent = function (funcin,funcout)  {
    this.mouseIn = false; var obj = this;
    this.hoverEvents.push([funcin,funcout])
    if(this.hoverEvents.length === 1){
        this.enterCursorEvent()
        this.parent.parent.attachEvent('mousemove', (...c)=>{
            if(!this.display) return
            if(c[0] < 0 || c[0] >this.parent.parent.canvas.width || c[1] < 0 || c[1] > this.parent.parent.canvas.height){
                obj.mouseIn = false; 
                for(let event of this.hoverEvents){
                    if(event[1]) event[1]() 
                }
                obj.parent.updateVisual();
                return;
            }
            var touch = obj.pointInShape(c[0],c[1]);
            if(obj.mouseIn && (!touch)){
                obj.mouseIn = false;
                for(let event of this.hoverEvents){
                    if(event[1]) event[1]() 
                }
                obj.parent.updateVisual();
            }
            
        })
        this.mouseMoveEvent.push(()=>{
            if(!obj.mouseIn){
                obj.mouseIn = true;
                for(let event of this.hoverEvents){
                    if(event[0]) event[0]() 
                }
                obj.parent.updateVisual()
            }
        })
    }
    return this
}

//Animation
lght.app.prototype.animate = function() {
    if(lght.frameTime !== undefined && lght.lastFrame !== undefined){
        let timeDifference = lght.frameTime - lght.lastFrame
        this.objects.forEach(e => {
            e.animate(timeDifference);
            e.shapes.forEach(a => {
                a.animate(timeDifference)
            })
        });
    }
}

const changeAnimating = function(bool){
    if(this.updateVisual) return this.updateVisual()
    return this.parent.updateVisual()
    if(typeof this.animating === 'number') this.animating = (bool)?1:0
    else this.parent.animating = (bool)?1:0
}

const addAnimation = function(property,v,time,e,resetWhenCancel,func){
    this.animationCount++;
    let id = this.animationCount;
    const initialValue = getByDotNotation(property,this)
    const value = ()=>{
        switch(typeof v){
            case 'number': return v;
            case 'function': return v();
            case 'string':
                if(v.match(/%/)) return initialValue * (1+parseInt(v)/100)
                else return initialValue + parseInt(v)
            default:
                throw Error("Getter type not supported")
        }
    }

    let timeout = setTimeout(()=>{
        this.cancelAnimation(id)
        changeByDotNotation(property,this,value())
        if(this.updateVisual) this.updateVisual()
        else if(this.parent.updateVisual) this.parent.updateVisual()
        if(func) func();
    },time)

    const alreadyAnimated = this.animations.find((animation)=>animation[0] === property)
    if(alreadyAnimated) this.cancelAnimation(alreadyAnimated[6])
    this.changeAnimating(true)
    this.animations.push([property,value,getByDotNotation(property,this),time,timeout,func,id,e,resetWhenCancel,lght.frameTime]);
    return this;
}

const awaitAnimation = function(...args){
    return new Promise(r=>this.addAnimation(...args,r))
}

const cancelAnimation = function(){
    for(let id of [...arguments]){
        let animation = this.animations.find(e=>e[6] === id)
        let index = this.animations.findIndex(e=>e[6]===id)
        if(!animation) return false
        clearTimeout(animation[4])
        this.animations.splice(index,1)
        this.changeAnimating(false)
        if(animation[8]) changeByDotNotation(animation[0],this,animation[2])
    }
}

const animate = function (time){
    let obj = this
    this.animations.forEach(animation=>{
        let [property,v,init,timeUp,timeout,func,id,e,reset,initTime] = animation
        const value = v()
        this.changeAnimating(true)
        // const easeCoeff = (e)?((e.match(/Degree/))?ease[e.split(' ')[0]]((lght.frameTime - initTime)/timeUp,e.split(' ')[1]):ease[e]((lght.frameTime - initTime)/timeUp)):1
        let newValue = getByDotNotation(property,obj) + (time/timeUp)*(value-init)
        if(init < value && newValue > value) newValue = value
        if(init>value && newValue < value) newValue = value
        changeByDotNotation(property,obj,newValue)
    })
}

const fadeIn = function(time){return new Promise(r=>this.addAnimation('opacity',1,time,r))}
const fadeOut = function(time){return new Promise(r=>this.addAnimation('opacity',0,time,r))}

const chainFunctionFactory = (func)=>function(){func.call(this,...arguments);return this}

const triggerBehavior = async function(n){for(let b of this.behaviors.find(({name})=>name===n).behavior) await Promise.allSettled(b.map(e=>e()))}

const addBehavior = chainFunctionFactory(function(name,arrayOfBehavior){return this.behaviors.push({name,behavior:arrayOfBehavior.map(e=>e.map(({kind,info})=>{
    switch(kind){
        case 'function': return async ()=>await info(this)
        case 'trigger':return async ()=>await Promise.allSettled(info.map(e=>this.triggerBehavior(e)));
        case 'animate':return async ()=>await this.awaitAnimation(...info);
        default:throw Error('Invalid behavior type');
    }
}))})})

let behaviorId = 0
const createBehavior = chainFunctionFactory(function(name,fu,opts=''){
    const func = (f)=>({kind:'function',info:async ()=>await f.call(this)})
    const trigger = (...t)=>{
        t.forEach(e=>{if(!this.behaviors.find(({name})=>name===e) && e!==name) this.activateBehavior(e)})
        return ({kind:'trigger',info:t})
    }
    const animate = (...a)=>({kind:'animate',info:a})
    const wait = (time)=>({kind:'function',info:()=>new Promise(r=>setTimeout(r,time))})
    const tree = (fu)=>{const name = `treeBehavior${behaviorId++}`;this.createBehavior(name,fu);return {kind:'function',info:async (obj)=>await this.triggerBehavior(name)}}
    const options = {}
    opts.split(' ').forEach(e=>options[e] = true)
    this.addBehavior(name,[...fu({func,trigger,animate,wait,tree}),(options.loop)?[trigger(name)]:[]]);
    (options.autoTrigger&&this.triggerBehavior(name))
})

lght.behaviors = []
lght.storeBehaviors = (name,fu,options)=>lght.behaviors.push({name,func:fu,options})

const activateBehavior = chainFunctionFactory(function(n){this.createBehavior(n,lght.behaviors.find(({name})=>name===n).func,lght.behaviors.find(({name})=>name===n).options)})

lght.animateFunctionReference = {
    changeAnimating,
    animate,
    addAnimation,
    cancelAnimation,
    fadeIn,
    fadeOut,
    triggerBehavior,
    addBehavior,
    createBehavior,
    awaitAnimation,
    activateBehavior,
    chainFunctionFactory
}

for(var prop in lght.animateFunctionReference){
    lght.object.prototype[prop] = lght.animateFunctionReference[prop];
    lght.shape.prototype[prop] = lght.animateFunctionReference[prop];
}

//Draw

lght.app.prototype.drawEverything = function(){
    this.clearCanvas();
    this.fillBackground();
    this.renderShape();
}

lght.app.prototype.createShadowApp = function(){
    this.shadowApp = []
    for(let {name,cacheMax} of this.objects) this.shadowApp.push({name,cacheMax:[...cacheMax]})
    this.objects.forEach(e=>e.populateCache())
}

lght.app.prototype.getMaxFromShadowApp = function(name){
    if(!this.shadowApp) return false
    const object = this.shadowApp.find(e=>e.name===name)
    if(object) return object.cacheMax
    return false
}

lght.app.prototype.getMaxFromObject = function(name){
    const object = this.objects.find(e=>e.name===name)
    return (object)?((object.cacheMax)?object.cacheMax:object.findMax()):false
}

lght.app.prototype.render = function(){
    if(!this.batchRender && !this.initiated){
        this.drawEverything()
        this.initiated = true
        return this.createShadowApp()
    }
    this.batchQueue.forEach(e=>this.renderObject(e))
    this.batchQueue.forEach(name=>{if(this.getObject(name)) this.getObject(name).populateCache()})
    this.batchQueue = []
    return
}

lght.app.prototype.visualInit = function(){
    this.backgroundColor = this.options.background;
    this.context = this.canvas.getContext("2d");
}

lght.app.prototype.renderShape = function(){
    this.renderPositions();

    this.objects.sort((a,b)=>a.zIndex -b.zIndex).forEach(obj=>{
        obj.draw();
    })
}

//<-------------------BASIC CANVAS STUFF---------------------->
//CLEARING CANVAS AND BACKGROUND COLOR
lght.app.prototype.clearCanvas = function(x=0,y=0,w=this.canvas.width,h=this.canvas.height){
    this.context.save(); 
    this.context.clearRect(x,y,w,h); 
    this.context.restore();
}

lght.app.prototype.fillBackground = function(x=0,y=0,w=this.canvas.width,h=this.canvas.height){
    if(this.backgroundColor!=='none'){
        this.context.save(); 
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(x,y,w,h);
        this.context.restore();
    }
}

/*POSITION INDICATOR FUNCTIONS GO HERE
Draw all position indicators at once to save performance from context state change*/
lght.app.prototype.renderPositions = function(){
    this.context.save();
    this.context.fillStyle = 'red';

    this.objects.forEach(({posX,posY,positionIndicator}) => {
        if(!positionIndicator) return
        this.context.beginPath()
        this.context.arc(posX,posY,5,0,2*Math.PI)
        this.context.closePath()
        this.context.fill()
    });
    
    this.context.restore();
}


/* SHAPE PRERENDERING FUNCTIONS GO HERE
Shape prerendering prerender shapes on canvases to save performance*/

lght.object.prototype.batch = function(){
    if(!this.parent.batchQueue.includes(this.name)) this.parent.batchQueue.push(this.name)
}

lght.object.prototype.updateVisual = function(){
    //If the dimension changes a new canvas have to be created
    var max = this.findMax();
    for(var i = 0;i<max.length;i++){
        if(~~ (max[i] + 0.5)!== ~~ (this.preloader.maxes[i] + 0.5)){
            this.cacheMax = max
            this.createPreloader(); return;
        }
    }

    this.clearPreloader();

    this.shapes.forEach(s=>{
        let x = this.preloader.ox + s.x*this.scale
        let y = this.preloader.oy + s.y*this.scale
        draw.drawShape(this.preloader.context,x,y,s,)
    })
    if(!this.parent.options.constantRender && !this.parent.options.batchRender) this.parent.turnFunctions(this.parent)
    if(this.parent.options.batchRender) this.batch()
}

lght.object.prototype.clearPreloader = function(){
    this.preloader.context.clearRect(0,0,this.preloader.width,this.preloader.height);
}

lght.object.prototype.createPreloader = function(){
    this.preloader = document.createElement('canvas');
    
    this.preloader.maxes = this.findMax();
    let [minX,maxX,minY,maxY] = this.preloader.maxes

    this.preloader.width = maxX-minX;
    this.preloader.height = maxY-minY;

    this.preloader.ox = this.posX - minX;
    this.preloader.oy = this.posY - minY;

    this.preloader.context = this.preloader.getContext('2d');

    this.updateVisual();
}

lght.object.prototype.drawPreloader = function(x,y,sx,sy,w,h){
    if(!this.display) return
    if([...arguments].every((e)=>typeof e === 'number')) return this.parent.context.drawImage(this.preloader,sx,sy,w,h,x,y,w,h)
    if(this.preloader.width >0 && this.preloader.height > 0){
        let x = this.preloader.maxes[0] + this.preloader.width/2;
        let y = this.preloader.maxes[2] + this.preloader.height/2;
        x = ~~(x+0.5); y = ~~(y+0.5);

        this.parent.context.save()
        this.parent.context.translate(~~(x+0.5),~~(y+0.5))
        draw.drawImg(this.parent.context,this.preloader,this.preloader.width,this.preloader.height);
        this.parent.context.restore()   
    }
}

const getVertexFromMax = (minX,maxX,minY,maxY)=>[[maxX,minY],[minX,minY],[minX,maxY],[maxX,maxY]]
const getSideFromMax = (...args)=>getVertexFromMax(...args).map((e,i)=>(i===getVertexFromMax(...args).length-1)?[...e,...getVertexFromMax(...args)[0]]:[...e,...getVertexFromMax(...args)[i+1]])
const getWidthHeightFromMax = (minX,maxX,minY,maxY)=>({w:(maxX-minX),h:(maxY-minY)})

lght.app.prototype.findConflict = function(name){
    const result = []
    const [minX1,maxX1,minY1,maxY1] = this.getMaxFromObject(name)
    this.objects.forEach((object)=>{
        if(object.name === name) return
        const [minX2,maxX2,minY2,maxY2] = this.getMaxFromObject(object.name)
        if (((minX1 < minX2) && (maxX1 > maxX2) && (minY1<minY2) && (maxY1>maxY2)) || ((minX2 < minX1) && (maxX2 > maxX1) && (minY2<minY1) && (maxY2>maxY1))) return result.push(object.name)
        const side1 = getSideFromMax(minX1,maxX1,minY1,maxY1)
        const side2 = getSideFromMax(minX2,maxX2,minY2,maxY2)
        for(let s1 of side1) for(let s2 of side2) if(findIntersection(s1,s2)) return result.push(object.name)
    })
    return result
}

lght.app.prototype.findConflictMax = function(minX1,maxX1,minY1,maxY1){
    const result = []
    this.objects.forEach((object)=>{
        const [minX2,maxX2,minY2,maxY2] =  this.getMaxFromObject(object.name)
        if (((minX1 < minX2) && (maxX1 > maxX2) && (minY1<minY2) && (maxY1>maxY2)) || ((minX2 < minX1) && (maxX2 > maxX1) && (minY2<minY1) && (maxY2>maxY1))) return result.push(object.name)
        const side1 = getSideFromMax(minX1,maxX1,minY1,maxY1)
        const side2 = getSideFromMax(minX2,maxX2,minY2,maxY2)
        for(let s1 of side1) for(let s2 of side2) if(findIntersection(s1,s2)) return result.push(object.name)
    })
    return result
}

lght.app.prototype.clearObject = function(minX,maxX,minY,maxY,oname){
    const {w,h} = getWidthHeightFromMax(minX,maxX,minY,maxY)
    this.clearCanvas(minX,minY,w,h)
    this.fillBackground(minX,minY,w,h)
    const conflict = this.findConflictMax(minX,maxX,minY,maxY)
    const os = [...conflict.map(e=>this.getObject(e))]
    const objects = this.objects.filter(({name})=>os.find(e=>e.name===name && e.name !== oname))
    objects.sort((a,b)=>a.zIndex -b.zIndex).forEach(obj=>{
        const [minX2,maxX2,minY2,maxY2] =this.getMaxFromObject(obj.name)
        //the min x of the subrectangle is the larger x, the max x is the smaller x
        //same with minY and maxY
        const minXActual = (minX>minX2)?minX:minX2
        const maxXActual = (maxX<maxX2)?maxX:maxX2
        const minYActual = (minY>minY2)?minY:minY2
        const maxYActual = (maxY<maxY2)?maxY:maxY2
        const {w,h} = getWidthHeightFromMax(minXActual,maxXActual,minYActual,maxYActual)
        const minXAdjusted = minXActual - minX2
        const minYAdjusted = minYActual - minY2
        obj.drawPreloader(minXActual,minYActual,minXAdjusted,minYAdjusted,w,h)
    })
}

lght.app.prototype.renderObject = function(name){
    const object = this.getObject(name)
    if(!object && this.shadowApp){
        if(this.getMaxFromShadowApp(object.name)){
            const [minX,maxX,minY,maxY] = this.getMaxFromShadowApp(name)
            return this.clearObject(minX,maxX,minY,maxY)
        }
        return
    }
    if(this.shadowApp) if(this.getMaxFromShadowApp(name)) if(JSON.stringify(this.getMaxFromShadowApp(name)) !== JSON.stringify(this.getMaxFromObject(name))) this.clearObject(...this.getMaxFromShadowApp(name),name)
    const [minX,maxX,minY,maxY] = this.getMaxFromObject(name)
    const conflict = this.findConflict(name)
    const {w,h} = getWidthHeightFromMax(minX,maxX,minY,maxY)
    this.clearCanvas(minX,minY,w,h)
    this.fillBackground(minX,minY,w,h)
    const os = [object,...conflict.map(e=>this.getObject(e))]
    const objects = this.objects.filter(({name})=>os.find(e=>e.name===name))
    objects.sort((a,b)=>a.zIndex -b.zIndex).forEach(obj=>{
        const [minX2,maxX2,minY2,maxY2] = this.getMaxFromObject(obj.name)
        //the min x of the subrectangle is the larger x, the max x is the smaller x
        //same with minY and maxY
        const minXActual = (minX>minX2)?minX:minX2
        const maxXActual = (maxX<maxX2)?maxX:maxX2
        const minYActual = (minY>minY2)?minY:minY2
        const maxYActual = (maxY<maxY2)?maxY:maxY2
        const {w,h} = getWidthHeightFromMax(minXActual,maxXActual,minYActual,maxYActual)
        const minXAdjusted = minXActual - minX2
        const minYAdjusted = minYActual - minY2
        obj.drawPreloader(minXActual,minYActual,minXAdjusted,minYAdjusted,w,h)
    })
}


//<------------------SHAPE DRAWING FUNCTION---------------->
lght.object.prototype.draw = function(){
    if(!this.display) return
    if(this.static && !this.animating) return this.drawPreloader()
    this.shapes.forEach(s=>{
        draw.drawShape(this.parent.context,s.absoluteX,s.absoluteY,s)
    })
}

//MASTER FUNCTION

lght.object.prototype.addShape = function (property) {
    let shape = new lght[property.kind](property,this);
    this.updateVisual()
    return shape
}

lght.object.prototype.addComponent = function(name,property){
    let shape = lght.component.addComponent(name,property,this)
    this.updateVisual()
    return shape
}

lght.app.prototype.addObject = function (property) {
    return new lght.object(property,this);
}

lght.app.prototype.getObject = function(name){
    const index =  this.objects.findIndex(e=>e.name===name)
    if(index<0) return false; return this.objects[index]
}

lght.app.prototype.addStorage = function (property){
    return new lght.storage(property,this)
}

lght.app.prototype.addAdvanceStorage = function(property){
    return new lght.advanceStorage(property,this)
}

lght.app.prototype.removeObject = function (obj) {
    this.objects.splice(this.objects.indexOf(obj),1);
}

export default lght