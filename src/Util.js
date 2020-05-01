import {baseAPI} from './api'
import cogoToast from  'cogo-toast'
import Store from './redux'

const dispatch = Store.dispatch
const createSkirmish = async ()=>{
      const {userToken} = Store.getState()
      const {data} = await baseAPI.post('/createUser',{gameMode:'Skirmish'},{headers:{Authorization:`JWT ${userToken}`}})
      const {error,message,token,playerid} = data
      if(error) cogoToast.error(message)
      else dispatch({type:'LOG_IN_SKIRMISH_GAME',token,playerid})
}

export {createSkirmish}