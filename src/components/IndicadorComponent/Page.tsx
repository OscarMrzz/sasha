"use client"
import React from 'react'

type Props = {
  idIndicador: number
  descripcionIndicador: string
  valorIndicador: number
  name: string
  EstaSeleccionado: boolean
  onChange: (id: number) => void
}

const IndicadorComponet = ({ idIndicador, descripcionIndicador, valorIndicador, name, EstaSeleccionado, onChange }: Props) => {
  return (
    /* quiero hacer un degradado de anaranjado a blanco */
    <div className='bg-gradient-to-r from-orange-500 to-orange-300 shadow pl-4 '>
      <input 
        type="radio" 
        className='mr-2 leading-tight' 
        name={name}
        value={idIndicador}
        checked={EstaSeleccionado}
        onChange={() => onChange(idIndicador)}
      />
      <span className='text-gray-800 font-bold'>{valorIndicador}</span> <span>{descripcionIndicador}</span>
    </div>
  )
}

export default IndicadorComponet
