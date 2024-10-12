import React, { useState,useRef, useEffect } from 'react'
import InputField from '../ui/inputField'
import { createCategory } from '../../../functions/category';
import { createTag } from '../../../functions/tag';

function CreateEntity({isOpen,onAddItem,entityType,popupRef}) {
    const [formEntity,setFormEntity] = useState({
        name:''
    });

    
    const handleChange = (e) => {
        const { value } = e.target;
        setFormEntity({ name : value});
    };

    const handleSubmit = async (e) => {
        if(e.key === 'Enter' && formEntity.name.trim() !== '' ) {
            e.preventDefault();
            try{
                let response;
                if(entityType === 'category') {
                    response = await createCategory({categoryName: formEntity.name});
                } else if(entityType === 'tag') {
                    response = await createTag({tagName: formEntity.name});
                }

                if(response) {
                    console.log()
                    onAddItem(response);
                } else {
                    console.error('No response:,', error);
                }
            } catch(error) {
                console.error(`Cannot create ${entityType}`)
            }
        }
    }

    
    

  return (
    isOpen ? (
        <div className='popup-overlay'>
            <div className='popup-content' ref={popupRef}>
                <div className='bg-purpleMain p-4 rounded-lg'>
                <h3>Create {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h3>
                    <InputField 
                        type="text"
                        placeholder={`Enter ${entityType}`}
                        value={formEntity.name}
                        onChange={handleChange}
                        onKeyDown={handleSubmit}
                    />
                </div>
            </div>
        </div>
    ) : null
  )
}

export default CreateEntity