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
        autoComplete='off'
        className={`text-white border-purpleNormal border-[2px] bg-transparent rounded-full px-4 focus:outline-none focus:border-purple-400 ${className}`}
    />
  )
}

export default InputField