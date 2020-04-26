import lght from './lght/lght'
let initiated = false
const init = ()=>{
      if(initiated) return
      initiated= true
      let pd = 2
      lght.addClass('shadow',{shadow:{color:'black',offsetX:3,offsetY:-3,blur:7}})
      lght.addComponent({name:'Card',kind:'roundedRectangle',borderOnly:true,color:'white',w:102.5*pd,h:145.5*pd,clip:true,borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black',shadow:{color:'black',blur:1.25*pd,offsetX:1.75*pd,offSetY:1.75*pd}})
      lght.addComponent({kind:'text',color:'black',fontFamily:'Arial Bold',name:'text'})
      lght.addComponent({name:'textBackground',kind:'roundedRectangle',color:'#ffffed',border:true,borderWidth:10,borderColor:'black',borderRadius:20,class:'shadow'})
      lght.addComponent({name:'turnIndicator',kind:'poly',specialPolygon:true,numberOfSide:3,color:'yellow',radius:10*pd,})
      lght.addComponent({name:'handCard',kind:'roundedRectangle',borderOnly:true,color:'white',w:102.5*1.2*pd,h:145.5*1.2*pd,clip:true,borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black',shadow:{color:'black',blur:1.25*pd,offsetX:1.75*pd,offSetY:1.75*pd}})
      lght.addComponent({name:'deckCard',kind:'roundedRectangle',color:'white',w:102.5*pd,h:145.5*pd,borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black'})
}

export default init