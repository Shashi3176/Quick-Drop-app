import { BackgroundBeamsWithCollision } from "../../components/ui/background-beams-with-collision";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export function LinkShare() {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<any | null>(null);
  const [link,setLink] = useState("null");

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
        
        setLink(data.link);        

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

  const handleCopy = async () => {
    try {
      
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error("Failed to copy:", err);
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
          <p className="font-semibold">Size: {typeof file.size === "number" ? formatSize(file.size) : "Unknown"}</p>
          <p className="font-semibold">Is Encrypted: {
              file.isEncrypted ? "True" : "False"
            }</p>
          <div className="flex mt-2 align-middle justify-center">
          <p className="mt-2 font-semibold">
            Link: 
          {id && (
            <a
              className="text-indigo-600 hover:underline ml-2 mt-2"
              href={`http://localhost:5173/downloadPage/${id}`}
              target="_blank"
              rel="noreferrer"
            >
              {file.link} 
            </a>
          )}
          </p>
          <button
            onMouseDown={handleCopy}
            className="px-4 py-2 ml-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition transform duration-150 ease-in-out"
            >
              Copy link
          </button>
          </div>
        </div>
      )}
    </>
  );
}