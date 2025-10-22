import { BackgroundBeamsWithCollision } from "../../components/ui/background-beams-with-collision";
import { FileUploadFinal } from "../../components/fileupload";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function UploadPage() {
  const [safe, setSafe] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    console.log(file);
    console.log("file recieved");
  };


  const [formData, setFormData] = useState(
    {
      expiryTime : "60",
      password: password,
      count: "1",
      isEncrypted: safe,
    }
  )

  const handleFormData = (e : any) => {
    setFormData({
      ...formData,
      [e.target.id] : e.target.value
    });
  }

  const navigate = useNavigate();
  
const handlePassword = (e: any) => {
  setPassword(e.target.value)
}

  const handleChange = () => {
    setSafe(!safe);      
  }

  useEffect(() => {
    setFormData({...formData, isEncrypted: safe});
  }, [safe])

  useEffect(() => {
    setFormData({...formData, password: password});
  }, [password])


  const handleSubmit = async(e: any) => {

    if (!selectedFile) {
    console.error("No file selected!");
    return;
  }

    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("file", selectedFile); // actual file
    formDataToSend.append("expiryTime", formData.expiryTime);
    formDataToSend.append("count", formData.count);
    formDataToSend.append("isEncrypted", String(formData.isEncrypted));
  if (formData.password) formDataToSend.append("password", formData.password);
   try {
     const response = await fetch("http://localhost:3000/upload",{
      method: "POST",      
      body: formDataToSend,
      credentials: "include",
        
    })

    const data = await response.json();

    if(!response.ok){
      console.log(data.message)
    }

    console.log(data);
    

    const link = data.link;

    navigate(link);
   } catch (error) {
    console.log(error);
   }

  }
  
  return (
    <>    
    <div>
      <div className="lg:mb-15 md:mb-10 mb-5">
      <BackgroundBeamsWithCollision className="absolute inset-0 -z-10 ">   
        <h6 className="text-1xl relative z-20 md:text-3xl lg:text-5xl font-bold text-black dark:text-white font-sans tracking-tight">                       
          <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
            <span className="">Simple - Private - Secured file sharing platform {" "}</span>
          </div>        
      </h6>
      
    </BackgroundBeamsWithCollision>
    </div>
    <div className="mb-2">
        <p className="flex text-base font-medium text-gray-800 dark:text-gray-200 mt-2">
          Share files safely and effortlessly. Every link is encrypted and automatically expires, keeping your data private and temporary by design.
        </p>
    </div>
  <FileUploadFinal onFileSelect={handleFileSelect}/>         

    <div className="flex ml-4">
        <div className="flex mt-2 mb-2">
        <p className="items-center text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">Your file will be deleted after </p>
        <select
          id="expiryTime"
          value={formData.expiryTime}
          onChange={handleFormData}
          className="w-auto ml-2 mr-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 hover:border-purple-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"          
        >
          <option value="60">60 mins</option>
          <option value="120">2 hours</option>
          <option value="360">6 hours</option>
          <option value="720">12 hours</option>
          <option value="1440">24 hours</option>
        </select>
        </div>

        <div className="flex mt-2 mb-2">
        <select
          id="count"
          value={formData.count}
          onChange={handleFormData}
          className="w-auto ml-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 hover:border-purple-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="1">1 download</option>
          <option value="5">5 downloads</option>
          <option value="10">10 downloads</option>
          <option value="20">20 downloads</option>
          <option value="50">50 downloads</option>
          <option value="100">100 downloads</option>
        </select>
      </div>          
    </div>
    

    <div className="space-y-4 rounded-lg  p-4 shadow-sm flex">
    <p className="flex items-center text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
      Encrypt with password
      <input
        type="checkbox"
        className="ml-3 h-4 w-4 cursor-pointer accent-blue-600"
        onChange={handleChange}
      />
    </p>

  {safe ? (
    <form className="flex flex-col space-y-2 ml-3">
      <input
        type="password"
        placeholder="Enter password"
        className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        onChange={handlePassword}
      />
    </form>
  ) : null}
  </div>

  <button
    type="button"
    className=" w-50 rounded-md"
    onClick={handleSubmit}
  >
    Upload
  </button>
   </div>

    </>
  );
}
