import lght from './lght/lght'
import init from './viewInit'
const pd = 2
const handHeight = 75*pd
const spriteLink = 'https://upload.wikimedia.org/wikipedia/commons/9/95/UNO_cards_deck.svg'
const mobileView = class{
  constructor(ref,ref2,ref3){
    init()
    this.cardSpriteColumn = 14
    this.cardSpriteRow = 8
    this.cardSpriteReference = {
      wild:[0,13],
      Draw4:[4,13],
      colorReference:['red','yellow','green','blue'],
      otherReference:['Skip','Reverse','Draw 2']
    }
    const configureCanvas = (ref,option={})=>{
      const app = new lght.app(ref,option)
      app.backgroundColor='none'
      app.pixelDensity = pd
      return app
    }
    this.app = configureCanvas(ref)
    this.staticApp = configureCanvas(ref2,{constantRender:false})
    this.cardApp = configureCanvas(ref3)
    var clientWidth = function () {  return Math.max(window.innerWidth);};
    var clientHeight = function () {  return Math.max(window.innerHeight);};
    this.app.canvas.width = clientWidth()*pd
    this.app.canvas.height = clientHeight()*pd
    this.staticApp.canvas.width = clientWidth()*pd
    this.staticApp.canvas.height = clientHeight()*pd
    this.staticApp.addObject({x:this.app.canvas.width/2,y:this.app.canvas.height/2,zIndex:-10}).addShape({kind:'roundedRectangle',w:this.app.canvas.width,h:this.app.canvas.height,clip:true,clipImageLink:'assets/woodMobile.jpg'})
    this.staticApp.turnFunctions(this.staticApp)
    this.positionReference = {
      leaderBoard:[this.app.canvas.width/2,75],
      drawDeck:[this.app.canvas.width/2 + 100*pd,this.app.canvas.height/2 - 40*pd],
      playDeck:[this.app.canvas.width/2 - 100*pd,this.app.canvas.height/2 - 40*pd],
      playerDeck:[this.app.canvas.width/2,this.app.canvas.height-(handHeight/2)]
    }
    let drawable = false
    let resolveFunction = ()=>{}
    this.drawDeck = this.createDeck('blue 2',...this.positionReference.drawDeck)
    this.drawDeck.addComponent('text',{text:'Draw Here',y:85*pd,fontSize:35})
    this.drawDeck.flip()
    this.drawDeck.pressedEvent(()=>{
      if(!drawable) return
      drawable = false
      resolveFunction()
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
    this.createActionPanel()
    this.drawColorChoser()
    this.drawSpecialInfo()
    this.drawEndGame()
    this.drawSoundIcon()
  }

  initiateWithGameMode(gameMode){
    this.drawAddBot(gameMode)
  }

  createPlayDeck = (currentTopCard)=>{
    this.playDeck = this.createDeck(currentTopCard,...this.positionReference.playDeck)
  }

  drawSoundIcon = ()=>{
    const soundIcon = this.app.addObject({x:50*pd,y:this.app.canvas.height/2 + 80*pd})
    const soundOn = soundIcon.addShape({kind:'img',drawWidth:70,spriteLink:'./assets/soundon.png',display:true})
    const soundOff = soundIcon.addShape({kind:'img',drawWidth:70,spriteLink:'./assets/soundoff.png',display:false})
    let sound = true
    soundIcon.pressedEvent(()=>{
      if(sound){
        lght.muteAll()
      }
      else{
        lght.unmuteAll()
      }
      soundOn.display = !soundOn.display
      soundOff.display = !soundOff.display
      soundIcon.updateVisual()
      sound = !sound
    })
  }

  drawEndGame(){
    const endGame = this.app.addObject({display:false,x:this.app.canvas.width/2,y:this.app.canvas.height/2 - 50*pd,zIndex:100000000})
    endGame.addComponent('textBackground',{w:700,h:400})
    const text = endGame.addComponent('text',{text:'Someone had won the game!',fontSize:50,y:-20})
    const changeInPointText = endGame.addComponent('text',{text:'',fontSize:30,y:30})
    let resolveFunction = ()=>{}
    const restartText = endGame.addComponent('text',{text:'New Game',fontSize:40,color:'blue',y:80})
    restartText.hoverEvent(()=>{
      restartText.color = 'yellow'
      endGame.updateVisual()
    },()=>{
      restartText.color = 'blue'
      endGame.updateVisual()
    })
    restartText.pressedEvent(()=>resolveFunction())
    this.activateEndGame = (name,func,changeInPoint)=>{
      text.text = `🎉 ${name} had won the game! 🎉`
      if(changeInPoint) changeInPointText.text = `You had gained ${changeInPoint} points!`
      endGame.updateVisual()
      endGame.display = true
      resolveFunction = func
    }
  }

  drawTutorial(){
    // const tutorial = this.app.addStorage({display:false,x:this.app.canvas.width/2,y:this.app.canvas.height/2 - 50*pd,zIndex:100000,direction:'column',spacing:5,})
    // tutorial.addShape({kind:'roundedRectangle',color:'#ffffed',w:this.app.canvas.width,h:750,border:true,borderWidth:10,borderColor:'black',borderRadius:20,shadow:{color:'black',offsetX:5,offsetY:-5,blur:10}})
    // const x = tutorial.addShape({kind:'img',spriteLink:'assets/crossIcon.png',drawWidth:50,x:320,y:-320})
    // x.pressedEvent(()=>tutorial.display = false)
    // tutorial.model = [
    //   '🎉 Welcome to Uno Online! 🎉',
    //   'Some quick pointers:',
    //   '👈 Use "Copy Link" from the left to automatically',
    //   'get a link you can send to your friends!',
    //   '👉 You can start the game when at least 2 players ',
    //   '(including bots) are present. The panel on the left',
    //   'show you who is in the game.',
    //   '👇 You can use the emote panel below to piss', 
    //   'off your friends when playing.',
    //   "👏 And that is it! If you have any feedback",
    //   "please 📧 me at vietlongali@gmail.com",
    //   "Have fun!",
    //   "Love this app? Buy me a beer on ",
    //   'Venmo @LongTran123'
    // ]
    // tutorial.elementFunction = (content)=>{
    //   const shape = tutorial.addShape({kind:'text',font:'30px Arial Bold',text:content})
    //   shape.x = -340 + 0.5*shape.width
    //   return shape
    // }
    // tutorial.updateToModel()
    // this.showTutorial = ()=>tutorial.display = true
    this.showTutorial = ()=>{}
  }

  drawAddBot(gameMode){
    const addBot = this.app.addObject({display:false,x:this.positionReference.leaderBoard[0],y:this.positionReference.leaderBoard[1] + 55*pd})
    const text = addBot.addComponent('text',{fontSize:35,text:'Add Bot 🤖',})
    let resolveFunction = ()=>{}
    text.hoverEvent(()=>{
      text.color = 'yellow'
      addBot.updateVisual()
    },()=>{
      text.color = 'black'
      addBot.updateVisual()
    })
    text.pressedEvent(()=>resolveFunction())
    this.startAddBot = (gameMode==='Competitive Player')?()=>{}:(func)=>{
      resolveFunction = func
      addBot.display = true
    }
    this.cancelAddBot = ()=>{
      addBot.display = false
    }
  }

  drawEmoteChooser(func){
    
  }

  animatePlayerPlay = (content)=>this.animatePlay(content,...this.positionReference.playerDeck)
  animatePlayerDraw = ()=>this.animateDraw(...this.positionReference.playerDeck)
  animateLeaderboardDraw = ()=>this.animateDraw(...this.positionReference.leaderBoard)
  animateLeaderboardPlay = (content)=> this.animatePlay(content,...this.positionReference.leaderBoard)

  drawSpecialInfo = ()=>{
    const specialInfo = this.app.addObject({x:this.positionReference.playDeck[0],y:this.positionReference.playDeck[1] + 85*pd})
    const text = specialInfo.addComponent('text',{fontSize:40,text:''})
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
    lght.playSound('./assets/draw.mp3')
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
    lght.playSound('./assets/deal.mp3')
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

  createActionPanel(actionFunction,gameMode){
    const actionalPanel = this.app.addStorage({x:this.app.canvas.width / 2,y:this.app.canvas.height/2 + 120*pd,spacing:50*pd})
    actionalPanel.addShape({kind:'roundedRectangle',display:false,w:this.app.canvas.width,h:150*pd,borderRadius:10*pd,color:'#ffffed',shadow:{color:'black',offsetX:5,offsetY:-5,blur:10},border:true,borderWidth:5,borderColor:'black'})
    actionalPanel.addShape({kind:'text',font:'40px Futura',text:"Actions:",y:-40*pd})
    actionalPanel.model = (gameMode==='Casual')?['Copy Link','Leave Game','Restart Game']:['Leave Game']
    actionalPanel.elementFunction = (link)=>{
      const shape = actionalPanel.addShape({kind:'text',font:'35px Futura',text:link})
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
    const leaderBoard = this.app.addStorage({x:this.app.canvas.width/2,y:75,spacing:0})
    const turnIndicator = this.app.addObject({display:false})
    turnIndicator.addShape({y:60*pd,kind:'poly',specialPolygon:true,numberOfSide:3,color:'yellow',radius:7*pd,rotation:90,border:true,borderColor:'black',borderWidth:7})
    let colors = ['#90ee90','#ee2400','#D3D3D3','#00FFFF']
    leaderBoard.elementFunction = (content,i)=>{
          return leaderBoard.addShape({kind:'rect',color:colors[i],w:this.app.canvas.width/4,h:150,border:true,borderColor:'black',borderWidth:5,shadow:{blur:7,color:'black',offsetY:5}})
      }
      leaderBoard.model = ['text1','test2','txt2','t34']
      leaderBoard.updateToModel()
      let textShapes = []
      let cardShape = []
      this.updateLeaderboard = (players,cards,point,gameWon)=>{
            leaderBoard.model = players
            leaderBoard.updateToModel()
            textShapes.forEach(e=>e.kill())
            textShapes = []
            cardShape.forEach(e=>e.kill())
            cardShape=[]
            players.forEach((name,i)=>{
                  const {x,y} = leaderBoard.storageShapes[i]
                  const text = leaderBoard.addShape({kind:'text',text:name,x,y:y-20,font:'30px Arial Bold',color:'black'})
                  textShapes.push(text)
            })
            cards.forEach((card,i)=>{
              const {x,y} = leaderBoard.storageShapes[i]
              let pointStr = (typeof point[i]=='number')?`Point: ${point[i]}`:''
              let gameWonStr = (gameWon)?`${gameWon[i]}`:''
              const text = leaderBoard.addShape({kind:'text',text:`Cards: ${card} ${gameWonStr} ${pointStr} `,x,y:y+5,font:'18px Arial Bold',color:'black'})
              textShapes.push(text)
          })
            this.staticApp.turnFunctions(this.staticApp)
      }

      let timeOut = null
      this.emote = (name,color,emoji)=>{
        clearTimeout(timeOut)
        const shape = textShapes.find(e=>e.text===name)

        shape.addAnimation('opacity',0,100,()=>{
          shape.text = emoji
          shape.font = '40px Arial Bold'
          leaderBoard.updateVisual()
          shape.addAnimation('opacity',1,100,()=>{
            timeOut = setTimeout(()=>{
              shape.addAnimation('opacity',0,100,()=>{
                shape.text = name
                shape.font = '30px Arial Bold'
                leaderBoard.updateVisual()
                shape.addAnimation('opacity',1,100)
              })
            },1500)
          })
        })

        
      }
    
    this.updateTurnIndicator = (turn)=>{
      const {absoluteY,absoluteX} = leaderBoard.shapes[turn]
      turnIndicator.addAnimation('x',absoluteX,200,()=>{
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
  }

  createHand(){
    let cards = []
    let resolveFunction = ()=>{}
    let verifyFunction = ()=>{}
    let onSelect = false
    const playerHand = this.cardApp.addStorage({spacing:-70*pd,y:0})
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
      const shape = playerHand.addShape({y:-37*pd,borderOnly:true,clipSpriteSheetX:position[1],clipSpriteSheetY:position[0],spriteLengthX:this.cardSpriteColumn,spriteLengthY:this.cardSpriteRow,kind:'roundedRectangle',color:'white',w:102.5*1.2 *pd,h:145.5*1.2*pd,clip:true,clipImageLink:spriteLink,borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black'})
      shape.pressedEvent((x,y)=>{
            if(!verifyFunction(content) || !onSelect) return
            if(y<100) return
            onSelect = false
            shape.kill()
            resolveFunction(content)
      })
      return shape
    }
    this.updateCards = (card)=>{
      playerHand.model = card
      this.cardApp.canvas.width = (playerHand.totalLength+300)
      this.cardApp.canvas.style.width = `${(playerHand.totalLength+300)/pd}px`
      playerHand.x = this.cardApp.canvas.width/2
      const height = 0.5*145.5*1.2*pd + 40*pd
      this.cardApp.canvas.height = height
      playerHand.y = height
      const clientWidth = 0.5*(window.innerWidth)
      const handWidth = 0.5*((playerHand.totalLength+300)/pd)
      if(handWidth<clientWidth) this.cardApp.canvas.style.left = `${clientWidth - handWidth}px`
      if(handWidth > clientWidth){
            this.cardApp.canvas.style.left = `0px`
            document.getElementById('scrollable').scrollLeft = handWidth-clientWidth
      }
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
      card.addShape({kind:'roundedRectangle',borderOnly:true,color:'white',w:102.5*pd,h:145.5*pd,clip:true,clipImageLink:'assets/back.svg',borderRadius:20*pd,border:true,borderWidth:1.25*pd,borderColor:'black',shadow:{color:'black',blur:1.25*pd,offsetX:1.75*pd,offSetY:1.75*pd}})
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
      shape.changeClipImage('assets/back.svg')
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
    const colorChooser = this.app.addStorage({display:false,zIndex:1000,x:this.app.canvas.width/2,y:this.app.canvas.height/2,model:colors,spacing:25,direction:'column'})
    colorChooser.addShape({kind:'roundedRectangle',w:300*pd,h:300*pd,borderRadius:10*pd,color:'white',shadow:{color:'black',offsetX:5,offsetY:-5,blur:10},border:true,borderWidth:5,borderColor:'black'})
    colorChooser.addShape({kind:'text',font:'35px Futura',text:'Choose a color:',y:-105*pd})
    colorChooser.elementFunction = (color,i)=>{
      const shape = colorChooser.addShape({kind:'roundedRectangle',w:250,h:50,color:'white'})
      shape.pressedEvent(()=>{if(choosingColor){resolveFunction(color);colorChooser.display = false}})
      return shape
    }
    colorChooser.updateToModel()
    colorChooser.storageShapes.forEach((e,i)=>{
      const {x,y} = e
      const color = colors[i]
      const shape = colorChooser.addShape({x,y,kind:'text',color:textColor[i],font:'45px Futura',text:color.split('').map((e,i)=>(i===0)?e.toUpperCase():e).join('')})
    })
    this.chooseColor = ()=>new Promise(r=>{
      colorChooser.display = true
      choosingColor = true
      resolveFunction = r
    })
  }

  drawAnnouncement(){
      let animationDuration = 100

      this.announcementQueue = []
      this.announcmentPerpetual = []
      this.onAnnouncementPerpetual = false
      this.onAnnoucementChanged = false
      
      //Format: [text,color,time/perpetual,started]
      this.announcement = this.app.addObject({x:this.app.canvas.width/2,y:110*pd,positionIndicator:false})
      this.annoucementText = this.announcement.addShape({kind:'text',font:'70px Futura',color:'orange',text:'',display:false})
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
      const shape = uno.addShape({kind:'img',spriteLink:'./assets/polygon.svg',scaleX:0,scaleY:0})
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
      const startGameObject = this.app.addObject({x:this.app.canvas.width/2,y:this.app.canvas.height/2+50*pd,display:false})
      const text = startGameObject.addShape({kind:'text',text:'Start Game',color:'black',font:'50px Futura'})
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
    lght.stopAll()
  }
}

export default mobileView