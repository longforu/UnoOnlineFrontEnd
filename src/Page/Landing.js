import React, { useState } from 'react'
import BarLoader from 'react-spinners/BarLoader'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {Formik,Form, Field} from 'formik'
import Polygon from '../polygon.svg'
import Title from '../title.svg'
import Logo from '../9.svg'
const {create} = require('../api')

function Checkbox(props) {
    return (
      <Field name={props.name}>
        {({ field, form }) => (
        <div className='ml-n3'> 
          <input 
          className='custom-control-input'
          type="checkbox"
          {...props}
          checked={field.value.includes(props.value)}
          onChange={() => {
            if (field.value.includes(props.value)) {
              const nextValue = field.value.filter(
                value => value !== props.value
              );
              form.setFieldValue(props.name, nextValue);
            } else {
              const nextValue = field.value.concat(props.value);
              form.setFieldValue(props.name, nextValue);
            }
          }}
        />
        <label className='ml-3'>
            {props.displayname}
          </label>
        </div>
        )}
      </Field>
    );
  }

const Landing = withRouter(connect(null,dispatch=>({dispatch}))(({dispatch,history})=>{
    const [loading,setLoading] = useState(false)

    const createGame = async ({username,houseRule})=>{
        setLoading(true)
        const {data} = await create(username,houseRule)
        const {token,id,playerid} = data
        dispatch({type:'LOG_IN',token,id,playerid})
        setLoading(false)
    }

    return (
        <div className='container background'>
            <div className={`row ${(window.mobileCheck())?"":'w-75'} mx-auto`} style={{maxWidth:(window.mobileCheck())?100000:400,fontFamily:'Arial Bold'}}>
            {!loading &&
                <div className='text-center mx-auto w-100 position-relative'>
                    <div className='mt-5 mb-5 floating'>
                      <img src={Polygon} style={{width:300,margin:'auto',width:'200px'}} className=''/>
                    </div>
                    <div><i>One</i> is an UNO-like card game that is completely playable online.</div>
                    <div className='text-secondary'>Made by Long Tran</div>
                    <div className='pt-4 pb-4 mt-3' style={{boxShadow:'0px 4px 16px rgba(31, 31, 31, 0.16)',border:'1px solid black',backgroundColor:'white',borderRadius:'15px'}}>
                        <Formik initialValues={{username:'',houseRule:[]}} onSubmit={createGame}>
                            {({handleSubmit,handleChange,handleBlur,values})=>(
                                <Form>
                                    <div className = 'container form-group'>
                                        <div className='w-50 mx-auto'>
                                            <label className='font-weight-bold '>Nickname:</label>
                                            <input type='username' name='username' className='form-control' onChange={handleChange} onBlur={handleBlur}/>
                                        </div>
                                        <label className='font-weight-bold mt-3'>House Rules:</label>
                                        <div className=' custom-control custom-checkbox mt-n1'>
                                            <Checkbox value='tripledouble' name='houseRule' displayname='Allow triple/double' className=''/>
                                        </div>
                                        <button className='btn btn-success mt-4' onSubmit={handleSubmit}>Create game!</button>
                                        
                                    </div>
                                </Form>
                            )}                            
                        </Formik>
                    </div>
                    <p className='text-secondary mt-2'>Joining a friend's game? Ask them for a personal link!</p>
                </div>
            }
            
            </div>
            <div style={{position:'absolute',top:'50%',width:'100%'}}>
                <BarLoader color='blue' loading={loading} width='200px' css={{margin:'auto'}}/>
            </div>
        </div>
    )
}))
export default Landing