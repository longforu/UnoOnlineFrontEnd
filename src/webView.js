import lght from './lght/lght'
import init from './viewInit'
const pd = 2
const handHeight = 75*pd
const spriteLink = 'https://upload.wikimedia.org/wikipedia/commons/9/95/UNO_cards_deck.svg'
const webView = class{
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
    this.staticApp.addObject({x:this.app.canvas.width/2,y:this.app.canvas.height/2,zIndex:-10}).addShape({kind:'roundedRectangle',w:this.app.canvas.width,h:this.app.canvas.height,clip:true,clipImageLink:'assets/wood.jpg'})
    this.staticApp.turnFunctions(this.staticApp)
    this.yRow = 0.4*this.app.canvas.height

    this.positionReference = {
      leaderBoard:[0.85*this.app.canvas.width,this.yRow],
      drawDeck:[0.38*this.app.canvas.width,this.yRow],
      playDeck:[0.62*this.app.canvas.width,this.yRow],
      actionPanel:[0.15*this.app.canvas.width,this.yRow]
    }

    let drawable = false
    let resolveFunction = ()=>{}
    this.drawDeck = this.createDeck('blue 2',...this.positionReference.drawDeck)
    this.drawDeck.name = 'drawDeck'
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
    this.drawColorChoser()
    this.drawSpecialInfo()
    this.drawEmote()
    this.drawAddBot()
    this.drawEndGame()
    this.drawSoundIcon()
    this.initAnimation()
  }

  createPlayDeck(currentTopCard){
    this.playDeck = this.createDeck(currentTopCard,...this.positionReference.playDeck)
    this.playDeck.name = 'playDeck'
  }

  drawSoundIcon = ()=>{
    const soundIcon = this.app.addObject({x:800*pd,y:50*pd,name:'sound'})
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
    endGame.addComponent('textBackground',{w:700,h:200})
    const text = endGame.addComponent('text',{text:'Someone had won the game!',fontSize:40,y:-10})
    let resolveFunction = ()=>{}
    const restartText = endGame.addShape({kind:'text',text:'New Game',font:'30px Arial Bold',color:'blue',y:50})
    restartText.hoverEvent(()=>{
      restartText.color = 'yellow'
      endGame.updateVisual()
    },()=>{
      restartText.color = 'blue'
      endGame.updateVisual()
    })
    restartText.pressedEvent(()=>resolveFunction())
    this.activateEndGame = (name,func)=>{
      text.text = `🎉 ${name} had won the game! 🎉`
      endGame.updateVisual()
      endGame.display = true
      resolveFunction = func
    }
  }

  drawTutorial(){
    const tutorial = this.app.addAdvanceStorage({display:false,alignX:true,alignDirectionX:'center',alignY:true,alignDirectionY:'center',alignMarginX:0,alignMarginY:-50*pd,zIndex:100000,direction:'column',spacing:5,paddingTop:10*pd,paddingBottom:10*pd,paddingLeft:10*pd,paddingRight:10*pd})
    tutorial.backgroundFunction = ()=>tutorial.addComponent('textBackground',{})
    const x = tutorial.addShape({kind:'img',spriteLink:'assets/crossIcon.png',drawWidth:50,x:320,y:-320})
    x.pressedEvent(()=>tutorial.display = false)
    tutorial.model = [
      '🎉 Welcome to One Online! 🎉',
      'Some quick pointers:',
      '👈 Use "Copy Link" from the left to automatically',
      'get a link you can send to your friends!',
      '👉 You can start the game when at least 2 players ',
      '(including bots) are present. The panel on the left',
      'show you who is in the game.',
      '👇 You can use the emote panel below to piss', 
      'off your friends when playing.',
      "👏 And that is it! If you have any feedback",
      "please 📧 me at vietlongali@gmail.com",
      "Have fun!",
      "Love this app? Buy me a beer on ",
      'Venmo @LongTran123'
    ]
    tutorial.elementFunction = (content)=>{
      const shape = tutorial.addComponent('text',{fontSize:30,text:content,textAlign:'left'})
      shape.x = -340
      return shape
    }
    tutorial.updateToModel()
    this.showTutorial = ()=>tutorial.display = true
  }

  drawAddBot(){
    const addBot = this.app.addObject({display:false,x:this.positionReference.leaderBoard[0],y:this.positionReference.leaderBoard[1] + 120*pd})
    const text = addBot.addShape({kind:'text',font:'35px Arial Bold',text:'Add Bot 🤖',})
    let resolveFunction = ()=>{}
    text.hoverEvent(()=>{
      text.color = 'yellow'
      addBot.updateVisual()
    },()=>{
      text.color = 'black'
      addBot.updateVisual()
    })
    text.pressedEvent(()=>resolveFunction())
    this.startAddBot = (func)=>{
      resolveFunction = func
      addBot.display = true
    }
    this.cancelAddBot = ()=>{
      addBot.display = false
    }
  }

  drawEmoteChooser(func){
    const emoteChooser = this.app.addStorage({x:250*pd,y:470*pd,spacing:-15,zIndex:-1})
    emoteChooser.addComponent('textBackground',{color:'white',w:370*pd,h:40*pd})
    emoteChooser.model = ['Emote:','💖','😡','👋','😂','😈','💩']
    emoteChooser.elementFunction = (content,index)=>{
      if(!index) return emoteChooser.addShape({kind:'text',text:content,fontSize:35,fontFamily:'Arial Bold'})
      const shape = emoteChooser.addShape({kind:'text',text:content,fontSize:30,fontFamily:'Arial Bold'})
      shape.hoverEvent(()=>{
        shape.fontSize = 50;
        emoteChooser.updateVisual()
      },()=>{
        shape.fontSize = 30;
        emoteChooser.updateVisual()
      })
      shape.pressedEvent(()=>func(content))
      return shape
    }
    emoteChooser.updateToModel()
  }

  drawEmote(){
    const emoteText = this.app.addObject({display:false,x:this.app.canvas.width/2,y:this.app.canvas.height/2 - 170*pd,zIndex:1000})
    const text = emoteText.addShape({kind:'text',text:"Someone emote something",font:'60px Arial Bold',color:'green'})
    emoteText.addShape({kind:'roundedRectangle',w:this.app.canvas.width,h:100,display:false})
    let timeInterval = null
    
    this.emote = (name,color,emoji)=>{
      clearInterval(timeInterval)
      text.text = `${name} emote ${emoji}`
      text.color = color
      emoteText.updateVisual()
      emoteText.display = true
      text.opacity = 0
      text.addAnimation('opacity',1,100,()=>{timeInterval = setTimeout(()=>{
        text.addAnimation('opacity',0,100,()=>{
          emoteText.display = false
        })
        },1000)
      })
    }
  }

  initAnimation(){
    this.animationQueue = []
    this.animationCallback = []
    let animating = false
    this.updateAnimation = async ()=>{
      if(animating) return
      if(!this.animationQueue.length) return
      animating = true
      const [playordraw,px,py,ec] = this.animationQueue.splice(0,1)[0]
      const firstFunc = this.animationCallback.splice(0,1)[0]
      //Animation: 0:play/draw 1: positionX, 2: positionY, 3: extra content
      if(playordraw==='play'){
        await this.animatePlay(ec,px,py)
        animating = false
        firstFunc()
        this.updateAnimation()
      }
      else{
        await this.animateDraw(px,py)
        animating = false
        firstFunc()
        this.updateAnimation()
      }
    }
    this.addToAnimationQueue = (queue,func)=>{
      this.animationQueue.push(queue)
      this.animationCallback.push(func)
      this.updateAnimation()
    }
  }

  animatePlayerPlay = (content)=>new Promise(r=>this.addToAnimationQueue(['play',...this.positionReference.playerDeck,content],r))
  animatePlayerDraw = ()=>new Promise(r=>this.addToAnimationQueue(['draw',...this.positionReference.playerDeck],r))
  animateLeaderboardDraw = ()=>new Promise(r=>this.addToAnimationQueue(['draw',...this.positionReference.leaderBoard],r))
  animateLeaderboardPlay = (content)=> new Promise(r=>this.addToAnimationQueue(['play',...this.positionReference.leaderBoard,content],r))


  drawSpecialInfo = ()=>{
    const specialInfo = this.app.addObject({x:this.positionReference.playDeck[0],y:this.positionReference.playDeck[1] + 85*pd})
    specialInfo.addShape({kind:'roundedRectangle',display:false,w:this.app.canvas.width,h:50*pd})
    const text = specialInfo.addShape({kind:'text',font:'40px Arial Bold',text:''})
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

  createActionPanel(actionFunction){
    const actionalPanel = this.app.addStorage({x:this.positionReference.actionPanel[0],y:this.positionReference.actionPanel[1],name:'actionPanel',spacing:20,direction:'column'})
    actionalPanel.addShape({kind:'roundedRectangle',w:120*pd,h:150*pd,borderRadius:10*pd,color:'#ffffed',shadow:{color:'black',offsetX:5,offsetY:-5,blur:10},border:true,borderWidth:5,borderColor:'black'})
    actionalPanel.addShape({kind:'text',font:'32px Arial Bold',text:"Actions:",y:-60*pd})
    actionalPanel.model = ['Copy Link','Leave Game','Restart Game']
    actionalPanel.elementFunction = (link)=>{
      const shape = actionalPanel.addShape({kind:'text',font:'30px Arial Bold',text:link})
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
    const leaderBoard = this.staticApp.addStorage({x:this.positionReference.leaderBoard[0],y:this.positionReference.leaderBoard[1],spacing:30,direction:'column',name:'leaderBoard'})
    leaderBoard.addComponent('textBackground',{w:150*pd,h:200*pd})
    leaderBoard.addComponent('text',{fontSize:32,text:'Turn Board:',y:-80*pd})
    const turnIndicator = this.app.addObject({display:false})
    turnIndicator.addComponent('turnIndicator',{x:85*pd,rotation:180})
    let color = ['green','red','darkyellow','blue']
    leaderBoard.elementFunction = (name,i)=> leaderBoard.addComponent('text',{fontSize:30,color:color[i],text:name})
    
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
    let cardElement = []
    this.updateLeaderboard = (players,cardsAmount)=>{
          cardElement.forEach(e=>e.kill())
          cardElement = []
          leaderBoard.model = players
          leaderBoard.updateToModel()
          leaderBoard.storageShapes.forEach((e,i)=>{
            const {x,y} = e
            cardElement.push(leaderBoard.addComponent('text',{text:`Cards: ${cardsAmount[i]}`,x,y:y+30,color:'grey',fontSize:20}))
          })
          this.staticApp.turnFunctions(this.staticApp)
    }
  }

  createHand(){
    let resolveFunction = ()=>{}
    let verifyFunction = ()=>{}
    let onSelect = false
    const playerHand = this.app.addStorage({name:'Hand',spacing:-70*pd,y:this.app.canvas.height-(handHeight/2),x:'50%'})
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
      const shape = playerHand.addComponent('handCard',{borderOnly:true,y:30,clipSpriteSheetX:position[1],clipSpriteSheetY:position[0],spriteLengthX:this.cardSpriteColumn,spriteLengthY:this.cardSpriteRow,clipImageLink:spriteLink})
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
            if(!verifyFunction(content) || !onSelect) return
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
    const deck = this.staticApp.addObject({x,y})
    deck.addComponent('deckCard',{x:6*pd,y:-5*pd})
    deck.addComponent('deckCard',{x:4*pd,y:-3.75*pd})
    deck.addComponent('deckCard',{x:3*pd,y:-2.5*pd})
    deck.addComponent('deckCard',{x:1.5*pd,y:-1.25*pd})
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
    const card = this.app.addObject({x:'50%',y:'50%',display:false})
    if(back){
      card.addComponent('Card',{clipImageLink:'assets/back.svg'})
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
    const shape = card.addComponent('Card',{clipSpriteSheetX:position[1],clipSpriteSheetY:position[0],spriteLengthX:this.cardSpriteColumn,spriteLengthY:this.cardSpriteRow,clip:true,clipImageLink:spriteLink})
  
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
    const colorChooser = this.app.addStorage({name:'Color Chooser',display:false,zIndex:1000,x:'50%',y:this.app.canvas.height/2 - 50*pd,model:colors,spacing:25,direction:'column'})
    colorChooser.addComponent('textBackground',{w:200*pd,h:200*pd})
    colorChooser.addComponent('text',{fontSize:35,text:'Choose a color:',y:-85*pd})
    colorChooser.elementFunction = (color,i)=>{
      const shape = colorChooser.addComponent('text',{color:textColor[i],fontSize:30,text:color.split('').map((e,i)=>(i===0)?e.toUpperCase():e).join('')})
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
      let animationDuration = 100

      this.announcementQueue = []
      this.announcmentPerpetual = []
      
      //Format: [text,color,time/perpetual,started]
      this.announcement = this.app.addObject({x:'50%',y:50*pd,name:'Announcement'})
      this.annoucementText = this.announcement.addComponent('text',{fontSize:10,text:'',display:false})
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
          else return
      }
    }

    addToAnnoucementQueue(text,color,time){
      this.announcementQueue.push([text,color,time,false])
      this.updateAnnouncement()
    }

    configureUnoMessage(){
      const uno = this.app.addObject({x:this.app.canvas.width/2,y:this.app.canvas.height/2,zIndex:1000,name:'One'})
      const shape = uno.addShape({kind:'img',spriteLink:'./assets/polygon.svg',scaleX:0,scaleY:0,drawWidth:500})
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
      const startGameObject = this.app.addObject({x:'50%',y:this.app.canvas.height-100*pd,display:false})
      const text = startGameObject.addComponent('text',{text:'Start Game',fontSize:50})
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

export default webView