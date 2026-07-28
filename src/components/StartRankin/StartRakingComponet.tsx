import { StarIcon } from '@heroicons/react/16/solid'
import React from 'react'

type Props = {
    promedio: number
    size?: string
}

export default function StartRakingComponet( {promedio, size = "w-8"}: Props) {

    if(promedio >=60 && promedio <64){
        /* MEDIA EXTRELLA */
        return (
            <div className='flex flex-row gap-2'>
                 <StarIcon className={size}   style={{ clipPath: "inset(0 50% 0 0)" }} />
            
            </div>
          )
    }

if(promedio >=64 && promedio <68){
    /* UNA EXTRELLA */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
  
        </div>
      )
}
if(promedio >=68 && promedio <72){
    /* UNA EXTRELLA Y MEDIA */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
          
                <StarIcon className={size}  style={{ clipPath: "inset(0 50% 0 0)" }} />
        </div>
      )
}
if(promedio >=72 && promedio <76){
    /* DOS ESTRELLAS */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
             <StarIcon className={size}   />
        </div>
      )
}
if(promedio >=76 && promedio <80){
    /* DOS ESTRELLAS Y MEDIA */
    return (
        <div className='flex flex-row gap-2'>
                <StarIcon className={size}   />
             <StarIcon className={size}   />
                <StarIcon className={size}  style={{ clipPath: "inset(0 50% 0 0)" }} />
        </div>
      )
}
if(promedio >=80 && promedio <84){
    /* TRES ESTRELLAS */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
        </div>
      )
}
if(promedio >=84 && promedio <88){
    /* TRES ESTRELLAS Y MEDIA */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
                <StarIcon className={size}   />
                <StarIcon className={size}   />
                <StarIcon className={size}  style={{ clipPath: "inset(0 50% 0 0)" }} />
        </div>
      )
}
if(promedio >=88 && promedio <92){
    /* CUATRO ESTRELLAS */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
        </div>
      )
}
if(promedio >=92 && promedio <96){
    /* CUATRO ESTRELLAS Y MEDIA */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
                <StarIcon className={size}  style={{ clipPath: "inset(0 50% 0 0)" }} />
        </div>
      )
}

if(promedio >=96){
    /* CINCO ESTRELLAS */
    return (
        <div className='flex flex-row gap-2'>
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
             <StarIcon className={size}   />
        </div>
      )
}
    return (<div className='flex flex-row gap-2'>
        
    </div>)


       


}
