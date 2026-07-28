import React from 'react'

const HiroComponet = () => {
  return (
    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] relative bg-slate-800">
      <div className="absolute inset-0 flex flex-col justify-center p-10">
        <div className="text-start text-white w-150">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Título Hero</h1>
          <p className="text-lg md:text-xl font-light">Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae eum, doloremque recusandae harum ab amet reprehenderit voluptates ex molestiae sunt voluptate possimus quia cumque non vitae tempora tempore soluta dolor.</p>
        </div>
        <div className='flex  gap-10 mt-10'>
             <button className='bg-red-500 w-35 h-12'>Precionar</button>
        <button className=' w-35 h-10 border-2 border-red-500'>Precionar</button>

        </div>
     
      </div>
      
    </div>
  )
}

export default HiroComponet
