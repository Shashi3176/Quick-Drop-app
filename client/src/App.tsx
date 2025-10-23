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

      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-900 text-center text-gray-700 dark:text-gray-300">
  <p className="mb-2">Developer: <span className="font-semibold">Shashank</span></p>
  <p className="flex justify-center gap-4">
    <p>
  <a 
    href='mailto:shashankssgm@gmail.com'
    className="underline hover:text-blue-500 !important"
  >
    Email
  </a>
    </p>
    <a href="https://www.linkedin.com/in/shashank-s-4a464b351/" target="_blank" className="underline hover:text-blue-500">LinkedIn</a>
    <a href="https://github.com/Shashi3176" target="_blank" className="underline hover:text-blue-500">GitHub</a>
  </p>
</footer>
    </>
  )
}

export default App
