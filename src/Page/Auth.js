import React, { useState } from 'react'
import { connect } from 'react-redux'
import Logo from '../Components/Logo'
import { Formik, Form } from 'formik'
import cogoToast from 'cogo-toast'
import {baseAPI} from '../api'
import BarLoader from 'react-spinners/BarLoader'

const Auth = connect(null,(dispatch)=>({dispatch}))(({dispatch})=>{
      const [loading,setLoading] = useState(false)
      const [signingIn,setSigningIn] = useState(false)

      const handleLogIn = ({error,token,message})=>{
            setLoading(false)
            if(error) return cogoToast.error(message)
            dispatch({type: 'LOG_IN_USER',userToken:token})
      }

      const signIn = async ({username,password})=>{
            setLoading(true)
            const {data} = await baseAPI.post('/login',{username,password})
            handleLogIn(data)
      }

      const signUp = async ({username,password})=>{
            setLoading(true)
            const {data} = await baseAPI.post('/signup',{username,password})
            handleLogIn(data)
      }

      return (<>
            <div className='w-100 mx-auto pb-5'>
                  <Logo/>
                        {!loading &&<div className='container bg-light signInBox pt-5 pb-2 pl-5 pr-5'>
                        {signingIn&&
                              <>
                                    <div className='text-center'>
                                          <h6 className='font-weight-bold '>Sign In <a className=' font-weight-light' href='/' onClick={(e)=>{e.preventDefault();setSigningIn(false)}}>| Sign Up</a></h6>
                                    </div>
                                    <Formik initialValues={{username:'',password:''}} onSubmit={signIn}>
                                          {({handleChange,handleSubmit,handleBlur})=>(
                                          <Form>
                                                <div className='form-group mt-3'>
                                                      <label className='text-secondary'>Username:</label>
                                                      <input type='username' name='username' onChange={handleChange} onBlur={handleBlur} className='form-control'></input>
                                                      <label className='text-secondary mt-2'>Password</label>
                                                      <input type='password' name='password' onChange={handleChange} onBlur={handleBlur} className='form-control'></input>
                                                      <button className='btn btn-success mt-3' onSubmit={handleSubmit}>Sign In</button>
                                                </div>
                                          </Form>
                                          )}
                                    </Formik>
                              </>
                        }
                        {!signingIn&&
                              <>
                                    <div className='text-center'>
                                          <h6 className='font-weight-bold '>Sign Up <a className=' font-weight-light' href='/' onClick={(e)=>{e.preventDefault();setSigningIn(true)}}>| Sign In</a></h6>
                                          
                                    </div>
                                    <Formik initialValues={{username:'',password:''}} onSubmit={signUp}>
                                          {({handleChange,handleSubmit,handleBlur})=>(
                                          <Form>
                                                <div className='form-group mt-3'>
                                                      <label className='text-secondary'>Username:</label>
                                                      <input type='username' name='username' onChange={handleChange} onBlur={handleBlur} className='form-control'></input>
                                                      <label className='text-secondary mt-2'>Password</label>
                                                      <input type='password' name='password' onChange={handleChange} onBlur={handleBlur} className='form-control'></input>
                                                      <label className='text-secondary mt-2'>Did Carole Baskin killed her husband? (Not required)</label>
                                                      <div><input type='checkbox'></input><span className='ml-2'>Absolutely</span></div>
                                                      <button className='btn btn-success mt-3' onSubmit={handleSubmit}>Sign Up</button>
                                                </div>
                                          </Form>
                                          )}
                                    </Formik>
                              </>
                        }
                        </div>}
                        <div style={{position:'absolute',top:'50%',width:'100%'}}>
                              <BarLoader color='blue' loading={loading} width='200px' css={{margin:'auto'}}/>
                        </div>
            </div>
      </>)
})

export default Auth