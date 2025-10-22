import './App.css';
import './index.css';
import { UploadPage } from './pages/upload.tsx';
import { LinkShare } from './pages/linkShare.tsx';
import { Route ,Routes } from "react-router"
import { DownloadPage } from './pages/dowloadPage.tsx';


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element = {<UploadPage/>}/>        
        <Route path='/file/:id' element = {<LinkShare/>}/>        
        <Route path='/downloadPage/:id' element = {<DownloadPage/>}/>        
      </Routes>
    </>
  )
}

export default App
