import React, { useEffect, useState, useRef } from 'react'
import {connect} from 'react-redux'
import Controller from '../controller'
import cogoToast from 'cogo-toast'
import mobileView from '../mobileView'
import testView from '../testView'
import {createSkirmish} from '../Util'
import {startMatchMaking,endMatchMaking} from '../waiting'

const Game = connect(({token,playerid,id,skirmish,userToken})=>({token,playerid,id,skirmish,userToken}),dispatch=>({dispatch}))(({token,playerid,id,dispatch,skirmish,userToken,triggerCompetitive})=>{
    const ref = useRef()
    const ref2 = useRef()
    const ref3 = useRef()
    
    const copyToClipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        cogoToast.success('Copied!')
    };
    const url = `http://onegame.us/join/${id}`

    const leaveGame = (skirmish)?()=>dispatch({type:'LOG_OUT_SKIRMISH_GAME'}):()=>dispatch({type:'LOG_OUT'})
    const restartCompetitive = async ()=>{
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

    let disconnectFunc = ()=>{}
    let startGame = async ()=>disconnectFunc=await Controller(ref.current,ref2.current,token,playerid,()=>copyToClipboard(url),leaveGame,ref3.current,restartCompetitive)
    useEffect(()=>{
      startGame()
      return ()=>{disconnectFunc()}
      // testView(ref.current)
    },[token])
    return (
      <div className="App">
        {!window.mobileCheck()&&
          <>
          <div className='d-flex game' style={{alignItems:'center',height:'100%',width:'100%',position:'absolute'}}>
            <canvas ref={ref}  style={{width:850,height:650,margin:'auto',backgroundColor:'transparent'}}></canvas>      
          </div>
          <div className='d-flex game2' style={{alignItems:'center',height:'100%',width:'100%',position:'absolute'}}>
            <canvas ref={ref2} style={{width:850,height:650,margin:'auto',backgroundColor:'transparent'}}></canvas>      
          </div>
          </>
        }
        {window.mobileCheck()&&
          <div className='position-absolute' id='scrollable' style={{overflowX:'auto',overflowY:'visible',position:'absolute',top:'0px',left:'0px',width:'100%',height:'100%'}}>
            <canvas ref={ref}  style={{zIndex:'100',position:'fixed',left:0,top:0,width:'100%',height:'100%',margin:'auto',backgroundColor:'transparent'}}></canvas>      
            <canvas ref={ref2} style={{zIndex:'0',position:'fixed',left:0,top:0,width:'100%',height:'100%',margin:'auto'}}></canvas>      
            <canvas ref={ref3} style={{zIndex:'1000',margin:'auto',position:'absolute',bottom:0,left:0}}></canvas>      
          </div>
        }
      </div>
    );
})
export default Game