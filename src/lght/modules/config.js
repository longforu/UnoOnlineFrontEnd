module.exports = (lght)=>{
    lght.inputReference = {};
    lght.inputReference.movementIndex = 
        ['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'];

    lght.inputReference.coeffIndex = 
        [[0,-1],[-1,0],[0,1],[1,0],[0,-1],[-1,0],[0,1],[1,0]];

    lght.defaultAppConfig = {
        initFunctions:["visualInit"],
        animateFunctions:["animate","update","render"],
        lastFrame:undefined,
        constantRender:true,
        background:"black",
    }

    lght.defaultObjectProps = {
        shapes:[],
        animations:[],
        animationCount:0,
        initFunctions:["createPreloader"],
        static:true,
        x:0,y:0,
        rotation:0, 
        positionIndicator:true,
    }

    lght.defaultShapeOptions = {
        kind:"rect",
        animations:[],
        animationCount:0,
        x:0,y:0,rotation:0,
        color:"black",display:true,
        lineWidth:1, opacity:1,
        cLayer:false,
        colorLayers:[],
        borderColor:'yellow',
        borderWidth:10,
        border:false, borderOnly:false,
    }

    lght.defaultRectOptions = {
        w:0,h:0,
    }

    lght.defaultArcOptions = {
        rad:0, arcDegree:360,
    }

    lght.defaultPolyOptions = {
        points:[],
    }

    lght.defaultLineOptions = {
        lx:0,ly:0,
        lineWidth:10,
        points:[],
    }

    lght.defaultTextOptions = {
        textAlign:'left',
        font:'10px Ariel',
        text:'Hello World'
    }

    lght.defaultImgOptions = {
        sprite:new Image(),
    }

    return lght
}