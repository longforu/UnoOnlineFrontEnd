const config = {}
config.inputReference = {};
config.inputReference.movementIndex = 
    ['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'];

config.inputReference.coeffIndex = 
    [[0,-1],[-1,0],[0,1],[1,0],[0,-1],[-1,0],[0,1],[1,0]];

config.defaultAppConfig = {
    initFunctions:["visualInit",'mouseInputInit'],
    animateFunctions:["animate","update","render"],
    lastFrame:undefined,
    constantRender:false,
    batchRender:true,
    background:"none",
    canvasOnly:true,
    pixelDensity:2,
    eventListeners:[],
    eventListenersFunction:[],
}

config.defaultCoordinateConfig = {
    x:0,y:0,
    alignX:false,
    alignDirectionX:'right',
    alignMarginX:5,
    alignY:false,
    alignDirectionY:'top',
    alignMarginY:5,
    hook:false,
    hookObject:{},
    hookFunction:()=>({}),
}

config.defaultDomConfig = {
    animations:[],
    animationIdentifier:[],
    animationCount:0,
    zIndex:0,
    type:'div'
}

config.defaultStyleConfig = {
    position:'absolute',
    translate:'transform(50%,50%)',
}

config.defaultGameConfig = {
    pixelDensity:2
}

config.defaultObjectProps = {
    shapes:[],
    animating:1,
    animations:[],
    behaviors:[],
    initBehaviors:[],
    hoverEvents:[],
    animationCount:0,
    initFunctions:["createPreloader"],
    static:true,
    rotation:0, 
    positionIndicator:false,
    display:true,opacity:1, cachable:[], cacheDependencies:[],
    mouseUpEvent:[],mouseDownEvent:[],mouseMoveEvent:[],
    zIndex:0,
    scale:1
}

config.defaultStorageProps = {
    spacing:0,
    direction:'row',
    model:[],
    margin:0
}

config.defaultAdvanceStorageProps = {
    paddingTop:10,
    paddingBottom:10,
    paddingLeft:10,
    paddingRight:10,
    backgroundFunction:null
}

config.defaultShapeOptions = {
    kind:"rect",
    animations:[],
    hoverEvents:[],
    initBehaviors:[],
    behaviors:[],
    animationCount:0,
    x:0,y:0,rotation:0,scaleX:1,scaleY:1,aScale:1,
    color:"black",display:true,
    lineWidth:1, opacity:1,
    borderColor:'yellow',
    borderWidth:10,
    border:false, borderOnly:false,
    shadow:null,mouseUpEvent:[],mouseDownEvent:[],mouseMoveEvent:[],
    cachable:[],
    cacheDependencies:[]
}

config.defaultRectOptions = {
    w:0,h:0,clip:false,
    clipImageLink:null,clipCanvas:null,
    clipSpriteSheetX:null,clipSpriteSheetY:null,
    spriteLengthX:null,spriteLengthY:null,
    shapeCachable:[],
    shapeCacheDependencies:[]
}

config.defaultArcOptions = {
    rad:0, arcDegree:360,
    shapeCachable:[],
    shapeCacheDependencies:[]
}

config.defaultTextOptions = {
    textAlign:'center',
    fontFamily:'Arial Bold',
    fontSize:10,
    text:'Hello World',
    fontBackwardCompatibility:undefined,
    shapeCachable:['textSize'],
    shapeCacheDependencies:['font']
}

config.defaultImgOptions = {
    spriteLink:null,
    drawWidth:null,drawHeight:null,
    loadedFunction:undefined
}

config.defaultPolyOptions = {
    points:[],
    specialPolygon:false,
    numberOfSide:0,
    radius:10,
    clip:false,
    clipImageLink:null
}

config.defaultLineOptions = {
    points:[]
}

config.modules = ['draw']

config.directoryPreset = ''
config.fileTypePreset = ''

export default config