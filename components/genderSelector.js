import React, { useState } from 'react'
import Select from 'react-select'

export default function GenderSelector() {
    const [value, setValue] = useState('')
    const options = [{
        label: "Male",
        value: "Male",
      },
      {
        label: "Female",
        value: "Female",
      }
    ]
  
    const changeHandler = value => {
      setValue(value)
    }
  
    return <Select options={options} value={value} onChange={changeHandler} placeholder='Select Gender'/>
  }