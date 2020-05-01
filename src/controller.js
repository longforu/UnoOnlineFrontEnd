import View from './view'
const io = require('socket.io-client')
const axios = require('axios')
const _ = require('lodash')

const Controller = async (canvasref,canvasstatic,token,userid,CopyLink,LeaveGame,canvasSpecial,compFunc)=>{
      let view = new View(canvasref,canvasstatic,canvasSpecial)
      let model = null
      let url = (process.env.NODE_ENV==='production')?'/game':'http://localhost:4000/game'
      if(window.mobileCheck() && process.env.NODE_ENV !== 'production') url = 'http://10.0.1.10:4000/game'
      const socket = io(url,{query:{token}})
      const play = (card)=>{
            socket.emit('Play Card',card)
      }

      const draw = ()=>{
            socket.emit('Draw Card')
      }

      const emote = (emoji)=>{
            socket.emit('Emote',emoji)
      }

      const sortHand = (hand)=>{
            if(!hand.length) return []
            const newhand = [...hand].map(e=>e.split(' ').slice(1).join(' '))
            const color = hand[0].split(' ')[0]
            const countable = newhand.filter(e=>parseInt(e)).map(e=>parseInt(e))
            const notCountable = newhand.filter(e=>!parseInt(e))
            const sorted = countable.sort((a,b)=>parseInt(a)-parseInt(b))
            return [...sorted,...notCountable].map(e=>`${color} ${e}`)
      }

      const sortDeck = (deck,currentTopCard)=>{
            const wild = deck.filter(e=>e.match(/Wild/) || e.match(/Draw 4/))
            const red = sortHand(deck.filter(e=>e.match(/red/)))
            const blue = sortHand(deck.filter(e=>e.match(/blue/)))
            const green = sortHand(deck.filter(e=>e.match(/green/)))
            const yellow = sortHand(deck.filter(e=>e.match(/yellow/)))
            const obj ={red,blue,green,yellow}
            let final = [...wild]
            for(let color in obj){
                  final = [...final,...obj[color]]
            }
            return final
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
            console.info(m)
            let oldModel = (model)?_.cloneDeep(model):null
            model = m
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
                  let newAnnoucements = model.feed.slice(oldModel.feed.length)
                  let newDirectives = model.directives.slice(oldModel.directives.length)
                  const players = model.players.map(e=>e.username)
                  view.updateLeaderboard(players,model.players.map(e=>e.cards.length),model.players.map(e=>(e.userid)?e.point:undefined))
                  if(newAnnoucements.length) newAnnoucements.forEach(message=>view.addToAnnoucementQueue(message,'black',500))
                  if(newDirectives.length){
                        for(let [code,user,otherinfo] of newDirectives){
                              switch(code){
                                    case 1:
                                          if(user === userid){
                                                await view.animatePlayerDraw()
                                                const latestDraw = model.players[userid].cards.slice(oldModel.players[userid].cards.length)[0]
                                                if(verify(latestDraw)) play(latestDraw)
                                                else socket.emit('Pass Turn')  
                                          }
                                          else await view.animateLeaderboardDraw()
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
                                          await view.UNO()
                                          break;
                                    case 7:
                                          const animateToPlayer = async ()=>{for(let i = 0;i<4;i++)(await view.animatePlayerDraw())}
                                          const animateToLeaderBoard = async ()=>{for(let i = 0;i<4;i++)(await view.animateLeaderboardDraw())}
                                          await animateToPlayer()
                                          await animateToLeaderBoard()
                                          break;
                                    case 8:
                                          for(let i = 0;i<otherinfo;i++){
                                                if(user===userid) await view.animatePlayerPlay(model.currentTopCard)
                                                else await view.animateLeaderboardPlay(model.currentTopCard)
                                          }
                                          break;
                                    default:break;
                              }
                        }
                  }
                  if(parseInt(oldModel.onTurn) != parseInt(model.onTurn) && model.onTurn >= 0) view.updateTurnIndicator(parseInt(model.onTurn))
                  const oldCard = oldModel.players[userid].cards
                  const newCard = model.players[userid].cards
                  if(JSON.stringify(oldCard) !== JSON.stringify(newCard))view.updateCards(sortDeck(model.players[userid].cards,model.currentTopCard))
            }
            else{
                  const gameMode = model.gameMode
                  const players = model.players.map(e=>e.username)
                  view.updateLeaderboard(players,model.players.map(e=>e.cards.length),model.players.map(e=>(e.userid)?e.point:undefined))
                  view.updateCards(sortDeck(model.players[userid].cards,model.currentTopCard))
                  if(model.onTurn>=0)view.updateTurnIndicator(model.onTurn)
                  view.createPlayDeck(model.currentTopCard)
                  view.drawTutorial(gameMode)
                  view.showTutorial()
                  view.initiateWithGameMode(gameMode)
                  view.createActionPanel({
                        CopyLink,
                        LeaveGame,
                        RestartGame:()=>socket.emit('Restart Game')
                  },gameMode)
            }
            if(!model.inGame && model.players.length > 1 && !model.endGame) view.initiateStartGameMessage(()=>socket.emit('Start Game'))
            else view.turnOffStartGameMessage()
            if(!model.inGame && model.players.length < 4 && !model.endGame) view.startAddBot(addBot)
            else view.cancelAddBot()
      }

      socket.on('Update',update)
      socket.on('New Game',(m)=>{
            view.kill()
            view = new View(canvasref,canvasstatic,canvasSpecial)
            view.drawEmoteChooser(emote)
            model = null
            update(m)
      })

      socket.on('End Game',({win,changeInPoint})=>{
            console.log(changeInPoint)
            let func
            if(model.gameMode !== 'Competitive Player') func = ()=>socket.emit('Restart Game')
            else func=compFunc
            view.activateEndGame(model.players[win].username,func,(changeInPoint)?changeInPoint[userid]:null)
            console.log('endGame')
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
      socket.on('Critical Error',LeaveGame)
      view.drawEmoteChooser(emote)
      return (()=>{
            socket.close()
            view.kill()
      })
}

export default Controller