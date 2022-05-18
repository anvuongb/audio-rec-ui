import React, { useState } from 'react'
import Select from 'react-select'

export default function MaskSelector() {
    const [value, setValue] = useState('')
    const options = [{
        label: "KN95",
        value: "KN95",
      },
      {
        label: "Cloth",
        value: "Cloth",
      },
      {
        label: "Surgical",
        value: "Surgical",
      },
      {
        label: "Other (Please specify)",
        value: "Other",
      }
    ]
  
    const changeHandler = value => {
      setValue(value)
    }
  
    return <Select options={options} value={value} onChange={changeHandler} placeholder='Mask type'/>
  }