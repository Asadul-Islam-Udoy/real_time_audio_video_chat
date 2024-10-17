import {Routes,Route} from 'react-router-dom'
import AudioCall from './page/VideoCall';
import AudioMuisc from './page/AudioMuisc';
function App() {
  return (
   <>
   <div>
    <div className='bg-blue-400 p-2 text-center'>
      <h1 className=' text-red-400'>React</h1>
    </div>
     <Routes>
       <Route path='/audio/call' element={<AudioCall/>}/>
       <Route path='/audio/muisc' element={<AudioMuisc/>}/>
     </Routes>
   </div>
   </>
  );
}

export default App;
