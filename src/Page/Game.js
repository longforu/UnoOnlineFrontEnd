import React, { useEffect, useState, useRef } from 'react'
import {connect} from 'react-redux'
import Controller from '../controller'
import cogoToast from 'cogo-toast'

const Game = connect(({token,playerid,id})=>({token,playerid,id}),dispatch=>({dispatch}))(({token,playerid,id,dispatch})=>{
    const ref = useRef()
    const ref2 = useRef()
    
    const copyToClipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        cogoToast.success('Copied!')
    };
    const url = `http://playuno.net/join/${id}`

    useEffect(()=>{
      Controller(ref.current,ref2.current,token,playerid,()=>copyToClipboard(url),()=>dispatch({type:'LOG_OUT'}))
    },[])
    return (
      <div className="App">
        <div className='d-flex game' style={{alignItems:'center',height:'100%',width:'100%',position:'absolute'}}>
          <canvas ref={ref}  style={{width:850,height:650,margin:'auto',backgroundColor:'transparent'}}></canvas>      
        </div>
        <div className='d-flex game2' style={{alignItems:'center',height:'100%',width:'100%',position:'absolute'}}>
          <canvas ref={ref2} style={{width:850,height:650,margin:'auto',backgroundColor:'transparent'}}></canvas>      
        </div>
      </div>
    );
})
export default Game