import {rotatePoint, degToRad, findAngle2Point } from './util.js'

const draw = {}
draw.drawShape = function(c,x,y,shape){
      x = ~~(x+0.5)
      y = ~~(y+0.5)
      if(!shape.display) return
      if(shape.border || shape.borderOnly) this.drawShapeKind(c,shape,x,y,true,1,shape.borderColor,shape.shadow);
      else if(!shape.borderOnly && !shape.border) this.drawShapeKind(c,shape,x,y,false,shape.opacity,shape.color,shape.shadow);
      if(!shape.borderOnly) this.drawShapeKind(c,shape,x,y,false,shape.opacity,shape.color);
  }
  
  draw.drawShapeKind = function(c,s,x,y,stroke,opacity,color,shadow){
      opacity = opacity * s.parent.opacity;
      if(opacity === 0 || opacity <0 ) return
  
      const scale = s.trueScale
      c.save()
      c.globalAlpha = opacity
      c.fillStyle = color
      c.strokeStyle = color
      c.lineWidth = s.borderWidth
      c.translate(x,y)
      c.scale(s.scaleX,s.scaleY)
      
      if(shadow){
          const {color,blur,offsetX,offsetY} = shadow
          c.shadowColor = color
          c.shadowBlur = blur
          c.shadowOffsetX = offsetX
          c.shadowOffsetY = offsetY
      }
  
      switch(s.kind){
          case 'rect':
              draw.drawRect(c, s.w*scale, s.h*scale, s.rotation, stroke); break;
          case 'arc':
              draw.drawArc(c, s.rad*scale,s.arcDegree,s.rotation, stroke); break;
          case 'text':
              draw.drawText(c, s.text,s.font, stroke,s.textAlign ,s.w, s.h,s.rotation); break;
          case 'img':
              if(s.imageLoaded) draw.drawImg(c, s.sprite,s.w,s.h,s.rotation); break;
          case 'poly':
              draw.drawPoly(c, s.polyPoints,s.rotation, stroke); break;
          case 'line':
              if(stroke){
                  const points = s.points.map(((position,index)=>{
                      const [x,y] = position
                      if(index === 0){
                          const angle = degToRad(findAngle2Point(...position,...s.points[index+1]))
                          return [x-s.borderWidth*Math.cos(angle),y+s.borderWidth*Math.sin(angle)]
                      }
                      else if(index === s.points.length-1){
                          const angle = degToRad(findAngle2Point(...position,...s.points[index-1]))
                          return [x-s.borderWidth*Math.cos(angle),y+s.borderWidth*Math.sin(angle)]
                      }
                      else return [x,y]
                  }))
                  draw.drawLine(c,points,s.rotation,s.lineWidth+s.borderWidth);
              }
              else draw.drawLine(c,s.points,s.rotation,s.lineWidth); break;
          case 'roundedRectangle':
              draw.drawRoundedRectangle(c,s.w*scale,s.h*scale,s.rotation,s.borderRadius,stroke)
              break
          default:
              break
      }
      if(s.clip && s.clipImageLoaded){
          c.clip()
          c.rotate(degToRad(s.rotation))
          if(typeof s.clipSpriteSheetX === 'number' && typeof s.clipSpriteSheetY === 'number'){
              const spriteWidth = s.clipImage.width / s.spriteLengthX
              const spriteHeight = s.clipImage.height / s.spriteLengthY
              const clipStartX = s.clipSpriteSheetX * spriteWidth
              const clipStartY = s.clipSpriteSheetY * spriteHeight
              c.drawImage(s.clipImage,clipStartX,clipStartY,spriteWidth,spriteHeight,(-s.width/2)/s.scaleX,(-s.height/2)/s.scaleY,s.width/s.scaleX,s.height/s.scaleY)
          }
          else c.drawImage(s.clipImage,(-s.width/2)/ s.scaleX,(-s.height/2)/ s.scaleY,s.width / s.scaleX,s.height / s.scaleY)
      }
  
      c.restore()
  }
  
  //DRAWING RECTANGLE
  draw.drawRect = function(c,w,h,rotation,stroke){
      c.rotate(degToRad(360-rotation))
      if(stroke) c.strokeRect(-w/2,-h/2,w,h);
      else c.fillRect(-w/2,-h/2,w,h);
  }
  
  draw.drawRoundedRectangle = (c,w,h,rotation,borderRadius,stroke)=>{
      c.rotate(degToRad(360,rotation))
      c.beginPath()
      c.moveTo(0,-h*0.5)
      c.lineTo(-w*0.5+borderRadius,-h*0.5)
      c.quadraticCurveTo(-w*0.5,-h*0.5,-w*0.5,-h*0.5+borderRadius)
      c.lineTo(-w*0.5,h*0.5-borderRadius)
      c.quadraticCurveTo(-w*0.5,h*0.5,-w*0.5+borderRadius,h*0.5)
      c.lineTo(w*0.5-borderRadius,h*0.5)
      c.quadraticCurveTo(w*0.5,h*0.5,w*0.5,h*0.5-borderRadius)
      c.lineTo(w*0.5,-h*0.5+borderRadius)
      c.quadraticCurveTo(w*0.5,-h*0.5,w*0.5-borderRadius,-h*0.5)
      c.lineTo(0,-h*0.5)
      c.closePath()
      if(stroke) c.stroke()
      else c.fill()
  }
  
  //DRAWING CIRCLES
  draw.drawArc = function(c,rad,arcDegree,rotation,stroke){
      c.beginPath();
  
      const br = degToRad(360 - rotation - arcDegree);
      const er = degToRad(360 - rotation);
  
      if(arcDegree < 360){
          const [x,y] = rotatePoint(0,0,rad,0,360-rotation-arcDegree);
          c.moveTo(x,y); c.moveTo(0,0);
      }
  
      c.arc(0,0,rad,br,er);
  
      if(stroke) c.stroke();
      else c.fill();
      c.closePath();
  
  }
  
  //DRAWING TEXT
  
  draw.drawText = function(c,text,font,stroke,textAlign,width,height,rotation){
      c.font = font;
      c.rotate(degToRad(360-rotation))
      let x
      if(textAlign === 'center') x = ~~(-width/2 +  0.5)
      else if(textAlign==='left') x = 0
      else x=~~(-width + 0.5)
      if(stroke) c.strokeText(text,x,~~(height/3.5 + 0.5));
      else c.fillText(text,x,~~(height/3.5 + 0.5))
  }
  
  //DRAWING IMAGES
  draw.drawImg = function(c,sprite,w,h,rotation){
      c.rotate(degToRad(360-rotation));
      c.drawImage(sprite,-w/2,-h/2,w,h);
  }
  
  draw.drawPoly = (c,points,rotation,stroke) => {
      if(points.length === 0 || !points) return 
      c.rotate(degToRad(360-rotation))
      c.beginPath()
      c.moveTo(...points[0])
      points.forEach(([x,y])=>c.lineTo(x,y))
      c.closePath()
      if(stroke) c.stroke()
      else c.fill()
  }
  
  draw.drawLine = (c,points,rotation,lineWidth)=>{
      c.beginPath()
      c.rotate(degToRad(360-rotation))
      c.moveTo(...points[0])
      points.forEach(([x,y])=>c.lineTo(x,y))
      c.lineWidth = lineWidth
      c.stroke()
  }  


export default draw