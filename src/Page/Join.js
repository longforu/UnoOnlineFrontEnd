import React, { useState, useEffect } from 'react'
import BarLoader from 'react-spinners/BarLoader'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {Formik,Form} from 'formik'
import Logo from '../9.svg'
const {join} = require('../api')

const Join = (connect(({tempJoinId})=>({tempJoinId}),dispatch=>({dispatch}))(({dispatch,changeHistory,tempJoinId})=>{
    const [loading,setLoading] = useState(false)


    useEffect(()=>{
        console.log(tempJoinId)
        if(!tempJoinId){
            dispatch({type:'JOINED'})
        }
    },[])

    const joinGame = async ({username})=>{
        setLoading(true)
        console.log(tempJoinId)
        const {data} = await join(tempJoinId,username)
        const {token,id,playerid} = data
        console.log(data)
        dispatch({type:'JOIN_LOG_IN',token,id,playerid})
        setLoading(false)
    }

    return (
        <div className='container'>
            <div className='row w-50 mx-auto' style={{maxWidth:400}}>
            {!loading &&
                <div className='text-center w-100 mx-auto' style={{fontFamily:'Arial Bold'}}>
                    <img src={Logo} style={{width:300,margin:'auto'}} className='floating'/>
                    <div className='text-secondary'>Online version by Long Tran</div>
                    <div className='pt-5 pb-5 mt-5' style={{boxShadow:'0px 4px 16px rgba(31, 31, 31, 0.16)',border:'1px solid black',borderRadius:'15px',backgroundColor:'white'}}>
                        <Formik initialValues={{username:''}} onSubmit={joinGame}>
                            {({handleSubmit,handleChange,handleBlur})=>(
                                <Form>
                                    <div className = 'container w-50'>
                                        <label className='font-weight-bold'>Nickname</label>
                                        <input type='text' name='username' className='form-control' onChange={handleChange} onBlur={handleBlur}/>
                                        <button className='btn btn-success mt-4' onSubmit={handleSubmit}>Join game!</button>
                                    </div>
                                </Form>
                            )}                            
                        </Formik>
                    </div>
                </div>
            }
            </div>
            <div style={{position:'absolute',top:'50%',width:'100%'}}>
                <BarLoader color='blue' loading={loading} width='200px' css={{margin:'auto'}}/>
            </div>
        </div>
    )
}))
export default Join