import React from 'react'

const FooterComponent = () => {
  return (
    <div className=" h-full w-full flex items-center text-white justify-between px-4">
        {/* dame un footer normal tipico */}
        <div className='flex gap-4'>
            <p>© 2023 Rubrica de competencia</p>
            <p>Todos los derechos reservados</p>
            </div>
    </div>
  )
}

export default FooterComponent
