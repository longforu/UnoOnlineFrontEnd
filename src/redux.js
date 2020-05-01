import { startMatchMaking } from './waiting'

const {createStore} = require('redux')

const token = localStorage.getItem('token')
const id = localStorage.getItem('id')
const playerid = parseInt(localStorage.getItem('playerid'))
const userToken = localStorage.getItem('usertoken')
const defaultState = {
    token,id,playerid,tempJoinID:null,joined:false,
    loggedIn:!!token,userToken,loggedInUser:!!userToken,matchMaking:false,skirmish:false,competitive:false
}

const reducer = (state=defaultState,{id,playerid,token,type,tempJoinId,userToken})=>{
    console.log(type,id,playerid,token,userToken)
    switch(type){
        case 'LOG_IN':
            localStorage.setItem('token',token)
            localStorage.setItem('id',id)
            localStorage.setItem('playerid',playerid)
            return {...state,id,playerid,token,loggedIn:true,skirmish:false,matchMaking:false}
        case 'JOIN_LOG_IN':
            localStorage.setItem('token',token)
            localStorage.setItem('id',id)
            localStorage.setItem('playerid',playerid)
            return {...state,id,playerid,token,loggedIn:true,joined:true}
        case 'LOG_OUT':
            localStorage.removeItem('token')
            localStorage.removeItem('id')
            localStorage.removeItem('playerid')
            return {...state,id:null,token:null,playerid:null,loggedIn:false}
        case 'LOG_OUT_WITH_TEMP_JOIN':
            localStorage.removeItem('token')
            localStorage.removeItem('id')
            localStorage.removeItem('playerid')
            return {...state,id:null,token:null,playerid:null,loggedIn:false,tempJoinId:state.tempJoinId||tempJoinId}
        case 'LOG_IN_SKIRMISH_GAME':
            return {...state,playerid,token,loggedIn:true,matchMaking:true,skirmish:true}
        case 'LOG_OUT_SKIRMISH_GAME':
            return {...state,playerid:null,loggedIn:false,token:null,skirmish:false}
        case 'END_MATCHMAKING':
            return {...state,matchMaking:false}
        case 'SET_TEMP_JOIN':
            console.log(tempJoinId)
            return {...state,tempJoinId}
        case 'JOINED':
            return {...state,joined:true}
        case 'LOG_IN_USER':
            localStorage.setItem('usertoken',userToken)
            return {...state,userToken,loggedInUser:true}
        case 'LOG_OUT_USER':
            localStorage.removeItem('usertoken')
            return {...state,userToken:null,loggedInUser:false,matchMaking:false}
        default:
            return{...state}
    }
}

const Store = createStore(reducer)

export default Store