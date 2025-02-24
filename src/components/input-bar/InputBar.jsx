import { useState } from 'react'

export default function InputBar() {

  const [texto, setTexto] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingDots, setLoadingDots] = useState("\u00a0\u00a0\u00a0\u00a0\u00a0")
  const [row, setRow] = useState(1)


  const handleOnSubmit = () => {

  }

  const calculateRow = (key) => {

  }

  return (
    <div 
        className='input-container'>
          <div className='textarea-container'>
            <textarea
            className='textarea-input'
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleOnSubmit();
              } else if (e.key === "Enter" && e.shiftKey) {
                calculateRow("Enter")
              } else if (e.key === "Backspace") {
                calculateRow("Backspace")
              }
            }}
            placeholder="Dime qué ingredientes tienes y te ayudaré a preparar un platillo..."
            rows={row}
            cols={50}
          />

            <div className='button-container'>
              <button disabled={loading} className='cook-button' onClick={handleOnSubmit}>
              {
                !loading 
                  ?
                  "¡A cocinar!"
                  :
                  "Cocinando".concat(loadingDots)
              }
            </button>
            </div>
          </div>
          
      </div>
  )
}
