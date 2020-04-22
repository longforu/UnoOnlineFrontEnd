import View from './view'
const io = require('socket.io-client')
const axios = require('axios')
const _ = require('lodash')

const Controller = async (canvasref,canvasstatic,token,userid,CopyLink,LeaveGame)=>{
      let view = new View(canvasref,canvasstatic)
      let model = null
      const url = (process.env.NODE_ENV==='production')?'/':'http://localhost:4000'
      const socket = io.connect(url,{query:{token}})
      view.showTutorial()
      const play = (card)=>{
            socket.emit('Play Card',card)
      }

      const draw = ()=>{
            socket.emit('Draw Card')
      }

      const emote = (emoji)=>{
            socket.emit('Emote',emoji)
      }
      
      const addBot = ()=>socket.emit('Add Bot')

      const verify = card=>{
            if(card === 'Wild' || card==='Draw 4' || model.currentTopCard === 'Wild' || model.currentTopCard === 'Draw 4') return true
            const color = model.currentTopCard.split(' ')[0]
            const action = model.currentTopCard.split(' ').slice(1).join(' ')
            const color2 = card.split(' ')[0]
            const action2 = card.split(' ').slice(1).join(' ')
            return ((color===color2) || (action===action2))
      }

      const update = async (m)=>{
            console.log(m)
            let oldModel = (model)?_.cloneDeep(model):null
            model = m
            if(!model.inGame && model.players.length > 1) view.initiateStartGameMessage(()=>socket.emit('Start Game'))
            else view.turnOffStartGameMessage()
            if(!model.inGame && model.players.length < 4) view.startAddBot(addBot)
            else view.cancelAddBot()
            if(parseInt(model.onTurn) == userid){
                  view.awaitSelection(verify).then((content)=>{view.cancelDraw();view.cancelSelection();play(content)})
                  view.awaitDraw().then(()=>{view.cancelSelection();view.cancelDraw();draw()})
            }
            else{
                  view.cancelDraw()
                  view.cancelSelection()
            }
            //check with old model
            if(oldModel){
                  if(parseInt(oldModel.onTurn) != parseInt(model.onTurn) && model.onTurn >= 0) view.updateTurnIndicator(parseInt(model.onTurn))
                  let newAnnoucements = model.feed.slice(oldModel.feed.length)
                  let newDirectives = model.directives.slice(oldModel.directives.length)
                  const players = model.players.map(e=>e.username)
                  const oldPlayer = oldModel.players.map(e=>e.username)
                  if(JSON.stringify(players) !== JSON.stringify(oldPlayer)) view.updateLeaderboard(players)
                  if(newAnnoucements.length) newAnnoucements.forEach(message=>view.addToAnnoucementQueue(message,'black',500))
                  if(newDirectives.length){
                        for(let [code,user] of newDirectives){
                              switch(code){
                                    case 1:
                                          if(user === userid){
                                                await view.animatePlayerDraw()
                                                const latestDraw = model.players[userid].cards.slice(oldModel.players[userid].cards.length)[0]
                                                if(verify(latestDraw)) play(latestDraw)
                                                else socket.emit('Pass Turn')  
                                          }
                                          else view.animateLeaderboardDraw()
                                          break;
                                    case 2:
                                          if(user === userid) for(let i = 0;i<4;i++)(await view.animatePlayerDraw())
                                          else for(let i = 0;i<4;i++)(await view.animateLeaderboardDraw())
                                          break;
                                    case 3:
                                          if(user === userid) for(let i = 0;i<2;i++)(await view.animatePlayerDraw())
                                          else for(let i = 0;i<2;i++)(await view.animateLeaderboardDraw())
                                          break;
                                    case 4:
                                          if(user===userid) await view.animatePlayerPlay(model.currentTopCard)
                                          else await view.animateLeaderboardPlay(model.currentTopCard)
                                          break;      
                                    case 5:
                                          view.UNO()
                                          break;
                                    case 7:
                                          const animateToPlayer = async ()=>{for(let i = 0;i<4;i++)(await view.animatePlayerDraw())}
                                          const animateToLeaderBoard = async ()=>{for(let i = 0;i<4;i++)(await view.animateLeaderboardDraw())}
                                          animateToPlayer()
                                          animateToLeaderBoard()
                                          break;
                                    default:break;
                              }
                        }
                  }
                  const oldCard = oldModel.players[userid].cards
                  const newCard = model.players[userid].cards
                  if(JSON.stringify(oldCard) !== JSON.stringify(newCard))view.updateCards(model.players[userid].cards)
            }
            else{
                  const players = model.players.map(e=>e.username)
                  view.updateLeaderboard(players)
                  view.updateCards(model.players[userid].cards)
                  if(model.onTurn>=0)view.updateTurnIndicator(model.onTurn)
                  view.playDeck = view.createDeck(model.currentTopCard,view.app.canvas.width/2 + 150,279*2)
            }
      }

      socket.on('Update',update)
      socket.on('New Game',(m)=>{
            view.kill()
            view = new View(canvasref,canvasstatic)
            view.createActionPanel({
                  CopyLink,
                  LeaveGame,
                  RestartGame:()=>socket.emit('Restart Game')
            })
            view.drawEmoteChooser(emote)
            model = null
            update(m)
      })

      socket.on('End Game',(winner)=>{
            view.activateEndGame(model.players[winner].name)
      })

      socket.on('Choose Color',async ()=>{
            const color = await view.chooseColor()
            socket.emit('Choose Color',color)
      })

      socket.on('Error',(error)=>console.log(error))
      socket.on('Emote',({emoji,userid})=>{
            const colorCode = ['green','red','black','blue']
            view.emote(model.players[userid].username,colorCode[userid],emoji)
      })
      socket.on('Delete Inactive',()=>view.changeAnnoucementPerpetual('This game was delete due to inactivity'))

      view.createActionPanel({
            CopyLink,
            LeaveGame,
            RestartGame:()=>socket.emit('Restart Game')
      })
      view.drawEmoteChooser(emote)
      console.log = ()=>{}
}

export default Controller