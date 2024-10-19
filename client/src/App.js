import {Routes,Route} from 'react-router-dom'
import VideoCall from './page/VideoCall';
import AudionCall from './page/AudioCall';
import AudioMuisc from './page/AudioMuisc';

function App() {
  return (
   <>
   <div>
    <div className='bg-blue-400 p-2 text-center'>
      <h1 className=' text-red-400'>React</h1>
    </div>
     <Routes>
       <Route path='/video/call' element={<VideoCall/>}/>
       <Route path='/audio/call' element={<AudionCall/>}/>
       <Route path='/audio/muisc' element={<AudioMuisc/>}/>
     </Routes>
   </div>
   </>
  );
}

export default App;
