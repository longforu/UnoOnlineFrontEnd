import lght from './lght/lght'
const pd = 2
const handHeight = 75*pd
const spriteLink = 'https://upload.wikimedia.org/wikipedia/commons/9/95/UNO_cards_deck.svg'
const View = class{
  constructor(ref,ref2){

    this.cardSpriteColumn = 14
    this.cardSpriteRow = 8
    this.cardSpriteReference = {
      wild:[0,13],
      Draw4:[4,13],
      colorReference:['red','yellow','green','blue'],
      otherReference:['Skip','Reverse','Draw 2']
    }
    this.app = new lght.app(ref)
    this.app.backgroundColor = 'none'
    this.staticApp = new lght.app(ref2,{constantRender:false})
    this.staticApp.backgroundColor='none'
    this.app.pixelDensity = pd
    this.app.canvas.width = 850*pd
    this.app.canvas.height = 650*pd
    this.staticApp.pixelDensity = pd
    this.staticApp.canvas.width = 850*pd
    this.staticApp.canvas.height = 650*pd
    console.log(this.staticApp.canvas)
    this.staticApp.addObject({x:this.app.canvas.width/2,y:this.app.canvas.height/2,zIndex:-10}).addShape({kind:'roundedRectangle',w:this.app.canvas.width,h:this.app.canvas.height,clip:true,clipImageLink:'assets/wood.jpg'})
    this.staticApp.turnFunctions(this.staticApp)
    this.positionReference = {
      leaderBoard:[700*pd,279*pd],
      drawDeck:[300*pd,279*pd],
      playDeck:[this.app.canvas.width/2 + 75*pd,279*pd],
      playerDeck:[this.app.canvas.width/2,this.app.canvas.height-(handHeight/2)]
    }

    let drawable = false
    let resolveFunction = ()=>{}
    this.drawDeck = this.createDeck('blue 2',300*pd,279*pd)
    this.drawDeck.addShape({kind:'text',text:'Draw Here',color:'black',y:85*pd,font:'35px Futura'})
    this.drawDeck.flip()
    this.drawDeck.pressedEvent(()=>{
      if(!drawable) return
      else resolveFunction()
    })
    this.awaitDraw = ()=>new Promise(r=>{
            drawable = true
            resolveFunction = (r)
    })
    this.cancelDraw = ()=>drawable = false

    this.createHand()
    this.createLeaderboard()
    this.drawAnnouncement()
    this.configureStartGameMessage()
    this.configureUnoMessage()    
    this.drawColorChoser()
    this.drawSpecialInfo()
  }

  animatePlayerPlay = (content)=>this.animatePlay(content,...this.positionReference.playerDeck)
  animatePlayerDraw = ()=>this.animateDraw(...this.positionReference.playerDeck)
  animateLeaderboardDraw = ()=>this.animateDraw(...this.positionReference.leaderBoard)
  animateLeaderboardPlay = (content)=> this.animatePlay(content,...this.positionReference.leaderBoard)



  drawSpecialInfo = ()=>{
    const specialInfo = this.app.addObject({x:this.positionReference.playDeck[0],y:this.positionReference.playDeck[1] + 85*pd})
    specialInfo.addShape({kind:'roundedRectangle',display:false,w:this.app.canvas.width,h:50*pd})
    const text = specialInfo.addShape({kind:'text',font:'40px Futura',text:''})
    const colors = ['red','blue','yellow','green']
    const textColor = ['red','blue','#9b870c','green']
    this.activateInfo = (color)=>{
      console.log(color)
      const tc = textColor[colors.indexOf(color)]
      text.color = tc
      text.text = color.split('').map((e,i)=>(i===0)?e.toUpperCase():e).join('')
      specialInfo.updateVisual()
    }
    this.cancelInfo = ()=>{
      text.text = ''
      specialInfo.updateVisual()
    }
  }

  animateDraw = (endX,endY)=>new Promise(r=>{
    const animationTime = 500
    const card = this.createCard(null,true)
    card.x = this.positionReference.drawDeck[0]
    card.y = this.positionReference.drawDeck[1]
    card.zIndex = -1
    card.display = true
    card.addAnimation('x',endX,animationTime)
    card.addAnimation('y',endY,animationTime)
    card.shapes[0].addAnimation('scaleX',0.2,animationTime,r)
    card.shapes[0].addAnimation('scaleY',0.2,animationTime,()=>card.kill())
  })

  animatePlay = (content,startX,startY)=>new Promise(r=>{
    const animationTime = 500
    const card = this.createCard(content)
    card.shapes[0].scaleX = 0.2
    card.shapes[0].scaleY = 0.2
    card.x = startX
    card.y = startY
    card.display = true
    card.addAnimation('x',this.playDeck.x,animationTime,()=>{
      this.playDeck.kill()
      this.playDeck=card
    })
    card.addAnimation('y',this.playDeck.y,animationTime,r)
    card.shapes[0].addAnimation('scaleX',1,animationTime)
    card.shapes[0].addAnimation('scaleY',1,animationTime)
    if(content.match(/Draw 4/) || content.match(/Wild/)) this.activateInfo(content.split(' ')[0])
    else this.cancelInfo()
  })

  createActionPanel(actionFunction){
    const actionalPanel = this.app.addStorage({x:100*pd,y:279*pd,spacing:20,direction:'column'})
    actionalPanel.addShape({kind:'roundedRectangle',w:120*pd,h:150*pd,borderRadius:10*pd,color:'white',shadow:{color:'black',offsetX:5,offsetY:-5,blur:10},border:true,borderWidth:5,borderColor:'black'})
    actionalPanel.addShape({kind:'text',font:'32px Futura',text:"Actions:",y:-60*pd})
    actionalPanel.model = ['Copy Link','Leave Game','Restart Game']
    actionalPanel.elementFunction = (link)=>{
      const shape = actionalPanel.addShape({kind:'text',font:'30px Futura',text:link})
      shape.hoverEvent(()=>{
        shape.color = 'yellow'
        actionalPanel.updateVisual()
      },()=>{
        shape.color = 'black'
        actionalPanel.updateVisual()
      })
      shape.pressedEvent(()=>actionFunction[link.split(' ').join('')]())
      return shape
    }
    actionalPanel.updateToModel()
  }

  createLeaderboard(){
    const leaderBoard = this.staticApp.addStorage({x:700*pd,y:279*pd,spacing:10,direction:'column'})
    leaderBoard.addShape({kind:'roundedRectangle',w:120*pd,h:150*pd,borderRadius:10*pd,color:'white',shadow:{color:'black',offsetX:5,offsetY:-5,blur:10},border:true,borderWidth:5,borderColor:'black'})
    leaderBoard.addShape({kind:'text',font:'32px Futura',text:"Turn Board:",y:-60*pd})
    const turnIndicator = this.app.addObject({display:false})
    turnIndicator.addShape({x:85*pd,kind:'poly',specialPolygon:true,numberOfSide:3,color:'yellow',radius:10*pd,rotation:180})
    let color = ['green','red','darkyellow','blue']
    leaderBoard.elementFunction = (content,i)=>{return leaderBoard.addShape({kind:'text',font:'30px Futura',color:color[i],text:content})}
    
    this.updateTurnIndicator = (turn)=>{
      const {absoluteY,absoluteX} = leaderBoard.shapes[turn+2]
      turnIndicator.x = absoluteX + 10*pd
      turnIndicator.addAnimation('y',absoluteY,200,()=>{
        turnIndicator.display = true
        let numberOfLoops = 5
        const fadeOut = ()=>{
          numberOfLoops--
          if(numberOfLoops<0) return
          turnIndicator.addAnimation('opacity',0,500,fadeIn)
        }
        const fadeIn = ()=>turnIndicator.addAnimation('opacity',1,500,fadeOut)
        fadeOut()
      })
    }
    this.updateLeaderboard = (players)=>{
          leaderBoard.model = players
          leaderBoard.updateToModel()
          this.staticApp.turnFunctions(this.staticApp)
    }
  }

  createHand(){
    let cards = []
    let resolveFunction = ()=>{}
    let verifyFunction = ()=>{}
    let onSelect = false
    const playerHand = this.app.addStorage({spacing:-70*pd,y:this.app.canvas.height-(handHeight/2),x:this.app.canvas.width/2,model:cards})
    playerHand.addShape({kind:'rect',color:'brown',w:this.app.canvas.width,h:handHeight})
    playerHand.elementFunction = (content)=>{
      let position = []
      if(content.match(/Wild/)) position = this.cardSpriteReference.wild
      else if(content.match(/Draw 4/)) position = this.cardSpriteReference.Draw4
      else{
        const color = content.split(' ')[0]
        const action = content.split(' ').slice(1).join(' ')
        position[0] = this.cardSpriteReference.colorReference.indexOf(color)
        if(parseInt(action)) position[1] = parseInt(action)
        else position[1] = this.cardSpriteReference.otherReference.indexOf(action) + 10
      }
      const shape = playerHand.addShape({borderOnly:true,y:30,clipSpriteSheetX:position[1],clipSpriteSheetY:position[0],spriteLengthX:this.cardSpriteColumn,spriteLengthY:this.cardSpriteRow,kind:'roundedRectangle',color:'white',w:102.5*pd*1.2,h:145.5*pd*1.2,clip:true,clipImageLink:spriteLink,borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black',shadow:{color:'black',blur:1.25*pd,offsetX:1.75*pd,offSetY:1.75*pd}})
      shape.hoverEvent(()=>{
        if(verifyFunction(content) && onSelect) shape.borderColor = 'yellow'
        shape.borderWidth = 5*pd
        shape.addAnimation('y',-100,200)
      },()=>{
        shape.borderColor = 'black'
        shape.borderWidth = 1.25*pd
        shape.addAnimation('y',30,200)
      })
      shape.pressedEvent(()=>{
            if(!verifyFunction(content)) return
            onSelect = false
            shape.kill()
            resolveFunction(content)
      })
      return shape
    }
    this.updateCards = (card)=>{
      playerHand.model = card
      playerHand.updateToModel()
    }
    this.awaitSelection = (vf)=>new Promise(r=>{
      verifyFunction = vf
      resolveFunction = r
      onSelect = true
    })
    this.cancelSelection = ()=>onSelect = false
  }

  createDeck(content,x,y){
    const deckCardOption = {kind:'roundedRectangle',color:'white',w:102.5*pd,h:145.5*pd,borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black'}
    const deck = this.staticApp.addObject({x,y})
    deck.addShape({x:6*pd,y:-5*pd,...deckCardOption})
    deck.addShape({x:4*pd,y:-3.75*pd,...deckCardOption})
    deck.addShape({x:3*pd,y:-2.5*pd,...deckCardOption})
    deck.addShape({x:1.5*pd,y:-1.25*pd,...deckCardOption})
    const card = this.createCard(content)
    card.x = x; card.y = y
    card.shapes[0].shadow = null
    card.shapes[0].border = false
    card.display = true
    card.updateVisual()
    this.staticApp.turnFunctions(this.staticApp)
    return card
  }

  createCard(content,back = false){
    const card = this.app.addObject({x:this.app.canvas.width/2,y:this.app.canvas.height/2,display:false})
    if(back){
      card.addShape({kind:'roundedRectangle',borderOnly:true,color:'white',w:102.5*pd,h:145.5*pd,clip:true,clipImageLink:'assets/back.png',borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black',shadow:{color:'black',blur:1.25*pd,offsetX:1.75*pd,offSetY:1.75*pd}})
    }
    else{let flipped = false
    let position = []
    if(content.match(/Wild/)) position = this.cardSpriteReference.wild
    else if(content.match(/Draw 4/)) position = this.cardSpriteReference.Draw4
    else{
      const color = content.split(' ')[0]
      const action = content.split(' ').slice(1).join(' ')
      position[0] = this.cardSpriteReference.colorReference.indexOf(color)
      if(parseInt(action)) position[1] = parseInt(action)
      else position[1] = this.cardSpriteReference.otherReference.indexOf(action) + 10
    }
    const shape = card.addShape({clipSpriteSheetX:position[1],clipSpriteSheetY:position[0],spriteLengthX:this.cardSpriteColumn,spriteLengthY:this.cardSpriteRow,kind:'roundedRectangle',color:'white',w:102.5*pd,h:145.5*pd,clip:true,clipImageLink:spriteLink,borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black',shadow:{color:'black',blur:1.25*pd,offsetX:1.75*pd,offSetY:1.75*pd}})
  
    const changeToBack =()=>{
      shape.clipSpriteSheetX = null
      shape.changeClipImage('assets/back.png')
    }

    const changeToFront = ()=>{
      shape.clipSpriteSheetX = position[1]
      shape.changeClipImage(spriteLink)
    }

    const flipAnimation = (back=true)=>new Promise(r=>{
      shape.addAnimation('scaleX',0,100,()=>{
        if(back) changeToBack()
        else changeToFront()
        shape.addAnimation('scaleX',1,100,r)
      })
    })
    card.flip = ()=>{
      flipped = !flipped
      return flipAnimation(flipped)
    }}
    return card
  }

  drawColorChoser = ()=>{
    const colors = ['red','blue','yellow','green']
    const textColor = ['red','blue','#9b870c','green']
    let choosingColor = false
    let resolveFunction = ()=>{}
    const colorChooser = this.app.addStorage({display:false,zIndex:1000,x:this.app.canvas.width/2,y:this.app.canvas.height/2 - 50*pd,model:colors,spacing:25,direction:'column'})
    colorChooser.addShape({kind:'roundedRectangle',w:200*pd,h:200*pd,borderRadius:10*pd,color:'white',shadow:{color:'black',offsetX:5,offsetY:-5,blur:10},border:true,borderWidth:5,borderColor:'black'})
    colorChooser.addShape({kind:'text',font:'35px Futura',text:'Choose a color:',y:-85*pd})
    colorChooser.elementFunction = (color,i)=>{
      const shape = colorChooser.addShape({kind:'text',color:textColor[i],font:'30px Futura',text:color.split('').map((e,i)=>(i===0)?e.toUpperCase():e).join('')})
      shape.hoverEvent(()=>{
        shape.color = 'yellow'
        colorChooser.updateVisual()
      },()=>{
        shape.color = textColor[i]
        colorChooser.updateVisual()
      })
      shape.pressedEvent(()=>{if(choosingColor){resolveFunction(color);colorChooser.display = false}})
      return shape
    }
    colorChooser.updateToModel()
    this.chooseColor = ()=>new Promise(r=>{
      colorChooser.display = true
      choosingColor = true
      resolveFunction = r
    })
  }

  drawAnnouncement(){
      let animationDuration = 500

      this.announcementQueue = []
      this.announcmentPerpetual = []
      this.onAnnouncementPerpetual = false
      this.onAnnoucementChanged = false
      
      //Format: [text,color,time/perpetual,started]
      this.announcement = this.app.addObject({x:this.app.canvas.width/2,y:50*pd,positionIndicator:false})
      this.annoucementText = this.announcement.addShape({kind:'text',font:'100px Futura',color:'orange',text:'',display:false})
      this.announcement.addShape({kind:'roundedRectangle',w:this.app.canvas.width/2,h:100*pd,display:false})
      const fadeOut = (func)=>this.annoucementText.addAnimation('opacity',0,animationDuration,()=>{this.annoucementText.display=false;if(func) func()})
      const fadeIn = (funcDone)=>this.annoucementText.addAnimation('opacity',1,animationDuration,funcDone)
      const fadeOutThenFadeIn = (func,funcDone)=> fadeOut(()=>{func();this.annoucementText.display = true; fadeIn(funcDone)})

      this.updateAnnouncement = ()=>{
          if(this.announcementQueue.length > 0 && !this.announcementQueue[0][3]){
              let [text,color,time] = this.announcementQueue[0]
              fadeOutThenFadeIn(()=>{
                  this.annoucementText.text = text
                  this.annoucementText.color = color
                  setTimeout(()=>{this.announcementQueue.splice(0,1);this.updateAnnouncement();},time+animationDuration)
              })
              this.announcementQueue[0][3] = true
          }
          else if(this.announcementQueue.length >0) return
          else if(!this.onAnnouncementPerpetual && this.annoucementText.display) return fadeOut()
          else if(this.onAnnouncementPerpetual && ((!this.annoucementText.display) || this.onAnnoucementChanged)) return fadeOutThenFadeIn(()=>{
              let [text,color] = this.announcmentPerpetual
              this.annoucementText.text = text
              this.annoucementText.color = color
          })
      }
    }

    changeAnnoucementPerpetual(text,color){
      this.announcmentPerpetual = [text,color]
      this.onAnnoucementChanged = true
      this.updateAnnouncement()
    }

    addToAnnoucementQueue(text,color,time){
      this.announcementQueue.push([text,color,time,false])
      this.updateAnnouncement()
    }

    configureUnoMessage(){
      const uno = this.app.addObject({x:this.app.canvas.width/2,y:this.app.canvas.height/2,zIndex:1000})
      const shape = uno.addShape({kind:'img',spriteLink:'./assets/18.svg',scaleX:0,scaleY:0})
      uno.display = false
      this.UNO = ()=>{
        uno.display = true
        shape.addAnimation('scaleX',1.5,400,()=>{
          setTimeout(()=>{
            shape.addAnimation('scaleX',0,100,()=>uno.display = false)
            shape.addAnimation('scaleY',0,100)
          },500)
        })
        shape.addAnimation('scaleY',1.5,400)
      }
    }

    configureStartGameMessage(){
      const startGameObject = this.app.addObject({x:this.app.canvas.width-75*pd,y:this.app.canvas.height-30*pd,display:false})
      const text = startGameObject.addShape({kind:'text',text:'Start Game',color:'orange',font:'40px Futura'})
      startGameObject.addShape({kind:'roundedRectangle',w:200,h:100,display:false})
      let activated = false
      let resolveFunction = ()=>{}
      const fadeIn = ()=>{
          if(!activated){
              text.opacity = 1;
          }
          else text.addAnimation('opacity',1,1000,fadeOut)
      }
      const fadeOut = ()=>{
          if(!activated){
              text.opacity = 1
          }
          else text.addAnimation('opacity',0,1000,fadeIn)
      }

      startGameObject.pressedEvent(()=>{
          activated = false
          startGameObject.display = false
          resolveFunction()
      })

      this.initiateStartGameMessage = (func=()=>{})=>{
          if(!activated){
              resolveFunction = func
              activated = true
              startGameObject.display = true
              fadeOut()
          }
      }
      this.turnOffStartGameMessage = ()=>{
          startGameObject.display = false
      }
  }
  kill = ()=>{
    this.app.kill()
    this.staticApp.kill()
  }
}

export default View