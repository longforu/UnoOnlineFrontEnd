import lght from './lght/lght'

const testView = (canvas)=>{
      const app = new lght.app(canvas)
      app.backgroundColor = 'white'
      app.canvas.width = 850*2
      app.canvas.height = 650*2
      app.pixelDensity = 2
      const obj = app.addObject({alignX:true,alignY:true,alignDirectionX:'center',alignDirectionY:'center'})
      obj.addShape({kind:'text',text:'Hello',fontSize:40,fontFamily:'Arial Bold',textAlign:'left'})
      obj.makeDraggable()
}

export default testView