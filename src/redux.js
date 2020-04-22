const {createStore} = require('redux')

const token = localStorage.getItem('token')
const id = localStorage.getItem('id')
const playerid = parseInt(localStorage.getItem('playerid'))
const defaultState = {
    token,id,playerid,tempJoinID:null,joined:false,
    loggedIn:!!token,
}

const reducer = (state=defaultState,{id,playerid,token,type,tempJoinId})=>{
    switch(type){
        case 'LOG_IN':
            localStorage.setItem('token',token)
            localStorage.setItem('id',id)
            localStorage.setItem('playerid',playerid)
            return {...state,id,playerid,token,loggedIn:true}
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
        case 'SET_TEMP_JOIN':
            console.log(tempJoinId)
            return {...state,tempJoinId}
        case 'JOINED':
            return {...state,joined:true}
        default:
            return{...state}
    }
}

const Store = createStore(reducer)

export default Store