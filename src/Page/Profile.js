import React, { useEffect , useState} from 'react'
import { connect } from 'react-redux'
import BarLoader from 'react-spinners/BarLoader'
import {baseAPI} from '../api'
import cogoToast from 'cogo-toast'
import Polygon from '../polygon.svg'
import { createSkirmish } from '../Util'
import { endMatchMaking, startMatchMaking } from '../waiting'

const Profile = connect(({userToken,matchMaking})=>({userToken,matchMaking}),(dispatch)=>({dispatch}))(({userToken,dispatch,matchMaking,triggerCompetitive})=>{
      const [userInfo,setUserInfo] = useState(null)
      const [loading,setLoading] = useState(false)
      const fetchUserInfo = async ()=>{
            const {data} = await baseAPI.get('/user',{
                  headers:{
                        Authorization:`JWT ${userToken}`
                  }
            })
            const {error,message,user} = data
            if(error) return cogoToast.error(message)
            else setUserInfo(user)
      }
      useEffect(()=>{fetchUserInfo()},[])

      const toggleMatchMaking = async ()=>{
            setLoading(true)
            if(matchMaking){
                  endMatchMaking()
                  dispatch({type:'END_MATCHMAKING'})
            }
            else{
                  await createSkirmish()
                  startMatchMaking(userToken,({token,playerid})=>{
                        endMatchMaking()
                        dispatch({type:'LOG_IN',token,playerid})
                        triggerCompetitive()
                  },(message)=>{
                        dispatch({type:'END_MATCHMAKING'})
                        cogoToast.error(message)
                  })
                  
            }
            setLoading(false)
      }
      const botGame = async ()=>{
            setLoading(true)
            const {data} = await baseAPI.post('/createUser',{gameMode:'Competitive Bot'},{headers:{Authorization:`JWT ${userToken}`}})
            const {error,message,token,playerid} = data
            console.log(data)
            if(error) cogoToast.error(message)
            else dispatch({type:'LOG_IN',token,playerid})
            setLoading(false)
      }

      const casualGame = async ()=>{
            setLoading(true)
            const {data} = await baseAPI.post('/createUser',{gameMode:'Casual'},{headers:{Authorization:`JWT ${userToken}`}})
            const {error,message,token,playerid,id} = data
            console.log(data)
            if(error) cogoToast.error(message)
            else dispatch({type:'LOG_IN',token,playerid,id})
            setLoading(false)
      }
      console.info(userInfo)
      return(
            <div className=''>
                  <div className='container-fluid' style={{backgroundColor:'white'}}>
                        <div className='row '>
                              <div className='col-auto pt-2 pb-2 ml-2'>
                                    <img src={Polygon} style={{width:50}}/>
                              </div>
                              <div className='align-self-end text-secondary mb-2 text-sm' style={{fontSize:15}}>
                                    Made by Long Tran
                              </div>
                              <div className='col-auto ml-auto align-self-end mb-2'>
                                    <a href='/' className='text-primary mr-2' onClick={(e)=>{e.preventDefault()}}>Give Feedback</a>
                                    <a href='/' className='text-danger' onClick={(e)=>{e.preventDefault();dispatch({type:'LOG_OUT_USER'})}}>Log Out</a>
                              </div>
                        </div>
                  </div>
                  
                  {(userInfo&&!loading)&&
                        <div className='container mt-3'>
                              <h1>Welcome back! {userInfo.username}</h1>
                              <div className='row'>
                                    <div className='col-auto'>
                                          <h3>Stats:</h3>
                                          <ul>
                                                <li><span className='font-weight-bold'>Games Played:</span> {userInfo.gamePlayed}</li>
                                                <li><span className='font-weight-bold'>Games Won:</span> {userInfo.gameWon}</li>
                                                <li><span className='font-weight-bold'>Games Lost:</span> {userInfo.gameLost}</li>
                                                <li><span className='font-weight-bold'>Win Rate:</span> {Math.round((userInfo.gamePlayed)?(userInfo.gameWon/userInfo.gamePlayed)*100:0)}%</li>
                                                <li><span className='font-weight-bold'>Total Point:</span> {userInfo.points}</li>
                                                <li><span className='font-weight-bold'>Rank:</span> #{userInfo.rank[0]} ({~~(userInfo.rank[0]/userInfo.rank[1]* 100 + 0.5)} Percentile)</li>
                                                <li><span className='font-weight-bold'>Karma:</span> {userInfo.karma}/10</li>
                                                <div className='text-secondary text-small' style={{maxWidth:300,fontSize:15}}>Karma is gained when you finish a game and lost when you quit midgame. Higher karma means shorter matchmaking time.</div>
                                          </ul>
                                    </div>
                                    <div className='col-auto ml-lg-5 pb-5'>
                                          <h3>Play Now:</h3>
                                          <div className='mx-auto text-center mt-4 mx-auto'>
                                                <button className='btn btn-lg btn-outline-dark mx-auto w-100' onClick={toggleMatchMaking}>{(matchMaking)?'Stop Matchmaking':'Start Matchmaking'}</button>
                                                <br/>
                                                {!matchMaking&&
                                                <>
                                                <button className='btn btn-lg btn-outline-primary mx-auto mt-3 w-100' onClick={botGame}>Train with Bot</button>
                                                <br/>
                                                <button className='btn btn-lg btn-outline-success mx-auto mt-3 w-100' onClick={casualGame}>Create a casual game</button>
                                                <div className='text-secondary mt-1'>Tip! Training with bot still give you points!</div>
                                                </>}
                                                {matchMaking&&
                                                      <>
                                                            <button className='btn btn-lg btn-outline-primary mx-auto mt-3 w-100' onClick={createSkirmish}>Create Skirmish Game</button>
                                                            <br/>
                                                      </>
                                                }
                                          </div>
                                    </div>
                                    <hr className='d-block d-md-none'/>
                                    <div className='col-auto ml-lg-5 pb-5'>
                                          <h3>Messages:</h3>
                                          <div className='mx-auto text-center mt-4 mx-auto'>
                                                You have no messages yet
                                          </div>
                                    </div>
                              </div>
                        </div>
                  }
                  <div style={{position:'absolute',top:'50%',width:'100%'}}>
                        <BarLoader color='blue' loading={(!userInfo || loading)} width='200px' css={{margin:'auto'}}/>
                  </div>
            </div>
      )
})

export default Profile