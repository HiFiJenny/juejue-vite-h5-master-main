import React, { useEffect, useState } from 'react'

import { useNavigate } from "react-router-dom"
import Header from '@/components/Header'

import s from './style.module.less'
import { Button } from 'zarm'


const About = () => {
  
  const [state, setState] = useState();
  useEffect(()=>{
    let timers = 5
    setInterval(()=>{
      const num = timers --
      setState(num)
      if(num<0){
        clearInterval(num)
        setState('返回')
      }
    },1000)
  },[])
  const navigate = useNavigate();


  return <>
  
    <Header title='MSDS' />
    <div className={s.about}>
      
      <article>这是MSDS。</article>
      <Button disabled={state!='返回'?true:false}
      onClick={() => navigate(-1)}//////////怎么回到主页了我的表单呢
      plain={state!=='返回'?true:false}>{state}</Button>
    </div>
  </>
};

export default About;