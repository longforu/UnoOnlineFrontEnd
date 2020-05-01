import io from 'socket.io-client'

let socket = null
const startMatchMaking = (token,login,error)=>{
      let url = (process.env.NODE_ENV==='production')?'/waitingRoom':'http://localhost:4000/waitingRoom'
      if(window.mobileCheck() && process.env.NODE_ENV !== 'production') url = 'http://10.0.1.10:4000/waitingRoom'

      console.log(token)
      socket = io(url,{query:{userToken:token}})
      socket.on('Game Found',({token,playerid})=>{
            console.log('Found',token,playerid)
            login({token,playerid})
      })
      socket.on('Critical Error',(message)=>{
            error(message)
            socket.close()
            socket = null
      })
}

const endMatchMaking = ()=>{
      if(socket) socket.disconnect()
      socket =null
}

export {startMatchMaking,endMatchMaking}