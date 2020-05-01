import React,{useEffect,useState} from 'react';
import './App.css';
import {Provider,connect} from 'react-redux'
import {BrowserRouter as Router,Switch,Link,Route,useLocation,withRouter} from 'react-router-dom'
import Store from './redux'
import Game from './Page/Game';
import Join from './Page/Join';
import Landing from './Page/Landing';
import 'bootstrap/dist/css/bootstrap.min.css'
import lght from './lght/lght'
import Auth from './Page/Auth';
import Profile from './Page/Profile';
import BeatLoader from 'react-spinners/BeatLoader'
import BarLoader from 'react-spinners/BarLoader'
import {createSkirmish} from './Util'
import { endMatchMaking } from './waiting';
import {baseAPI} from './api'

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

const Content = withRouter(connect(({loggedIn,joined,loggedInUser,matchMaking,skirmish,userToken})=>({loggedIn,joined,loggedInUser,matchMaking,skirmish,userToken}),(dispatch)=>({dispatch}))(({loggedIn,dispatch,history,joined,loggedInUser,matchMaking,skirmish,userToken})=>{
    const {pathname} = window.location
    const [minimized,setMinimized] = useState(false)
    const [showCompetitive,setShowCompeititve] = useState(false)
    const [loading,setLoading] = useState(false)

    const joinUser = async (id)=>{
      setLoading(true)
      const {data} = await baseAPI.post('/joinUser',{id},{
        headers:{
          Authorization:`JWT ${userToken}`
        }
      })
      const {token,playerid,gameid} = data
      dispatch({type:'JOIN_LOG_IN',token,playerid,gameid})
      setLoading(false)
    }

    useEffect(()=>{
      lght.stopAll()
      if(pathname.match(/join/) && !joined){
        if(loggedInUser) joinUser(pathname.split('/')[2])
        else{
          const tempJoinId = pathname.split('/')[2]
          dispatch({type:'LOG_OUT_WITH_TEMP_JOIN',tempJoinId})
          history.push('/join')
        }
      }
      else if(loggedIn){
        if(!pathname.match(/game/)) history.push('/game')
      }
      else if(loggedInUser){
        history.push('/profile')
      }
      else if(!pathname.match('/auth')) history.push('/')
    },[loggedIn,joined,loggedInUser])

    return(
      <>
      <Switch>
        <Route path='/game' exact>
          <Game triggerCompetitive={()=>{
            setShowCompeititve(true)
            setTimeout(()=>setShowCompeititve(false),3000)
          }}/>
        </Route>
        <Route path='/join' exact>
          <Join changeHistory={history}/>
        </Route>
        <Route path='/'exact component={Landing}/>
        <Route path='/auth' exact component={Auth}/>
        <Route path='/profile' exact>
          <Profile triggerCompetitive={()=>{
            setShowCompeititve(true)
            setTimeout(()=>setShowCompeititve(false),3000)
          }}/>
        </Route>
      </Switch>
      <div className='backgrounddiv'></div>
      {matchMaking&&
      <div className='matchMaking pt-5 pb-5 text-secondary' style={{transform:(minimized)?`translate(${window.mobileCheck()?'90%':'100%'}, 0%)`:'none',bottom:(window.mobileCheck())?0:50,right:(window.mobileCheck())?0:50,width:(window.mobileCheck())?'100%':400}}>
        <div>Waiting for a match...</div>
        <div style={{fontSize:20}}>
          {skirmish&&'Enjoy the skirmish game!'}
          {!skirmish&&<a href='/' onClick={e=>{e.preventDefault();createSkirmish()}}>Create a skirmish game</a>}
        </div>
        <BeatLoader css={{margin:'auto',marginTop:20}} color='blue' loading={matchMaking}/>
        <div><a href='/' onClick={e=>{e.preventDefault();endMatchMaking();dispatch({type:'END_MATCHMAKING'})}}>End matchmaking</a></div>
        <div className='position-absolute icon' onClick={(e)=>{setMinimized(!minimized)}}>
          {minimized && '+'}
          {!minimized && '-'}
        </div>
      </div>}
      <div className='matchMaking pt-5 pb-5 text-secondary' style={{transform:(!showCompetitive)?'translate(120%, 0%)':'none',bottom:(window.mobileCheck())?0:50,right:(window.mobileCheck())?0:50,width:(window.mobileCheck())?'100%':400}}>
        <div className='font-weight-bold'>You are playing with another player! Wave 👋</div>
        <div className='text-secondary'>Enjoy the game!</div>
      </div>
      <div style={{position:'absolute',top:'50%',width:'100%'}}>
          <BarLoader color='blue' loading={loading} width='200px' css={{margin:'auto'}}/>
      </div>
      </>
    )
}))

function App() {
  return (
    <Provider store={Store}>
      <Router>
        <Content/>
      </Router>
    </Provider>
  );
}

export default App;
