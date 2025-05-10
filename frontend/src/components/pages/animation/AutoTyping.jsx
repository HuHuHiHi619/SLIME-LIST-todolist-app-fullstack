import React, { useEffect, useState } from 'react'

function AutoTyping({text = '', speed = 100 , pause = 1000}) {
    const [displayed, setDisplayed] = useState("")
    const [index,setIndex] = useState(0)
    const [deleting,setDeleting] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            if(!deleting && index < text.length){ // start typing
                setDisplayed((prev) => prev + text.charAt(index))
                setIndex((prev) => prev + 1)
            } else if(!deleting && index === text.length){ // pause then enter delete mode
                setTimeout(() => setDeleting(true),pause)
            } else if(deleting && index > 0){ // start deleting
                setDisplayed((prev) => prev.slice(0 ,-1))
                setIndex((prev) => prev - 1)
            } else if(deleting && index === 0){
                setDeleting(false)
            }
        },speed)
        return () => clearTimeout(timeout)
    }, [text, speed, index, deleting, pause]);
   
  return (
    <span className='text-white text-4xl mt-56 mr-24'>{displayed}</span>
  )
}

export default AutoTyping