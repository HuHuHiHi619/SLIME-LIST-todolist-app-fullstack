import React from 'react'

function InputField({type,placeholder,id,name,value,onChange,onKeyDown,className}) {
  return (
    <input 
        type={type}
        placeholder={placeholder}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`text-white border-purpleBorder border-[2px] bg-transparent rounded-lg p-4 px-4 focus:outline-none focus:border-purple-400 ${className}`}
    />
  )
}

export default InputField