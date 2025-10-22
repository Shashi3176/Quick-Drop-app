import { BackgroundBeamsWithCollision } from "../../components/ui/background-beams-with-collision";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function DownloadPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<any | null>(null);
  const [password, setPassword] = useState();

    const [formData, setFormData] = useState(
    {
      password: password,
      isEncrypted: "false",
    }
  )

 const handlePassword = (e: any) => {
    setPassword(e.target.value)
    setFormData({...formData,password})
  }
  useEffect(() => {
    if (!id) return;

    const fetchLink = `http://localhost:3000/file/${id}`;
    (async () => {
      try {
        const response = await fetch(fetchLink, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("data of error", data);
          return;   
        }
        
        if(data.isEncrypted){
            setFormData({...formData, isEncrypted: "true"});
        }
        else{            
            setFormData({...formData, isEncrypted: "false"});
        }

        setFile(data);
        console.log(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    })();
  }, [id]);

  const formatSize = (sizeInBytes: number) => {
    if (sizeInBytes >= 1024 * 1024) {
      return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      return (sizeInBytes / 1024).toFixed(2) + " KB";
    }
  };

  const downloadLink = "http://localhost:3000/download/" + id;
  const handleSubmit = async () => {
    try {
      const response = await fetch(downloadLink,{
        method: "POST",      
        body: JSON.stringify(formData),
        credentials: "include", 
      })

    const data = await response.json();
    console.log(data);

    window.location.href = data.downloadURL;
    } catch (err) {
      console.error(err);
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
      </div>
      <div className="mb-2">
        <p className="flex text-base font-medium text-gray-800 dark:text-gray-200 mt-2">
          Share files safely and effortlessly. Every link is encrypted and automatically expires, keeping your data private and temporary by design.
        </p>
      </div>

      {file != null && (
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded shadow ">
          <p className="font-semibold">Filename: {file.fileName ?? "Unknown"}</p>
          <p>Size: {typeof file.size === "number" ? formatSize(file.size) : "Unknown"}</p>

          <div className="space-y-4 rounded-lg  p-4 shadow-sm flex justify-center ">

          <p className="font-semibold mt-1">Is Encrypted: {
              file.isEncrypted ? "True" : "False"
        }</p>
        
        {
            file.isEncrypted && <form className="flex flex-col space-y-2 ml-3">
            <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    onChange={handlePassword}
                />                
            </form>
            }
          </div>
        
        <button
            type="button"
            className=" w-50 rounded-md"
            onClick={handleSubmit}
        >
            Download
        </button>
        
        </div>        
      )}
    </>
  );
}