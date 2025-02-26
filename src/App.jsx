import { useEffect, useState } from 'react';
import './App.css';
import OpenAI from 'openai';
import MAIN_IMAGE from '/images/main_image.png';
import ReactMarkdown from 'react-markdown';

import HeaderBar from './components/header-bar/HeaderBar';

function App() {

  const client = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_TOKEN, dangerouslyAllowBrowser: true });
  
  const [texto, setTexto] = useState('')
  const [row, setRow] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingDots, setLoadingDots] = useState("\u00a0\u00a0\u00a0\u00a0\u00a0")
  let intervalId = null
  const [context, setContext] = useState([])
  const reglas = "Te haré una pregunta, es Español y debes responder SIEMPRE EN ESPAÑOL con estas reglas: 1.- Responde siempre en español. 2.-Eres mi asistente experto en cocina. 3.- solo me puedes hablar sobre temas de cocina. 4.- Si te digo ingredientes, debes darme opciones de platillos que tengan solamente esos ingredientes. 5.- Dame respuestas cortas. 6.- Si me das recetas preguntame cuál me gustaría. 7.- Interactua conmigo: "
  const [firstUse, setFirstUse] = useState(true)

  useEffect(() => {
    const div = document.getElementsByClassName("content-area")

    if (div[0].scrollTop !== undefined && div[0].scrollHeight !== undefined) {
      div[0].scrollTop = div[0].scrollHeight
    }
  }, [context.length])

  const startLoadingDots = () => {
      intervalId = setInterval(() => {
          setLoadingDots((prev) => {
            
            if (prev === "\u00a0\u00a0\u00a0\u00a0\u00a0"){
              return ".\u00a0\u00a0\u00a0\u00a0"
            } else if (prev === ".\u00a0\u00a0\u00a0\u00a0") {
              return "..\u00a0\u00a0\u00a0"
            } else if (prev === "..\u00a0\u00a0\u00a0") {
              return "...\u00a0\u00a0"
            } else if (prev === "...\u00a0\u00a0") {
              return "....\u00a0"
            } else if (prev === "....\u00a0") {
              return "....."
            } else if (prev === ".....") {
              return "\u00a0\u00a0\u00a0\u00a0\u00a0"
            }
          })
          
      }, 200)
  }

  const stopLoadingDots = () => {
    clearInterval(intervalId)
    intervalId = null
  }

  const handleOnSubmit = async () => {

    if (texto === "") {
      return
    }

    setFirstUse(false)
    
    const question = texto
    setTexto("")
    
    const userQuestion = {
      role: "user",
      content: question,
    }

    setContext(prev => [...prev, userQuestion])
    setLoading(true);
    startLoadingDots();

    const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
          { role: 'system', content: reglas },
          ...context
        ]
    })

    setContext(prev => [...prev, stream.choices[0].message])
    setLoading(false)
    stopLoadingDots()
  }

  const handleStopSubmit = () => {
    setLoading(false)
  }

  const calculateRow = (key) => {
    let breaks = (texto + "\n").split("\n").length
    const maxLength = 5;
    
    if (key === "Backspace") { breaks -= 1 }
    
    if (breaks >= maxLength ) {
      setRow(5)
    } else if (breaks <= 0 ) {
      setRow(1)
    } else {
      setRow(breaks)
    }
    
  }

  return (
    <div className="app-container">
      
      <HeaderBar/>

      <img src={MAIN_IMAGE} alt='GenioCulinario.com' className={firstUse ? 'main-image' : "none"} />
      <div className={'content-area'}>
        { 
            context.map((message, key) => {

              const role = message.role

              return (
                <div key={key} className={ role === "user" ? 'user-message' : 'assistant-message'}>
                    <ReactMarkdown>{ message.content }</ReactMarkdown>
                </div>
              )
            })
        }

        <p className={loading ? "pensando-dialog" : "none"}>Cocinando{loadingDots}</p>

        
      </div>

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
              <button className='cook-button' onClick={loading ? handleStopSubmit : handleOnSubmit}>
              {
                !loading 
                  ?
                  "¡A cocinar!"
                  :
                  "Detener"
              }
            </button>
            </div>
          </div>
          
      </div>
        
    </div>
  );
}

export default App;