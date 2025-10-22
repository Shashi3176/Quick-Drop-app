import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import {v2 as cloudinary} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import cron from "node-cron";

import mongoose from 'mongoose';
import { format } from 'path';


dotenv.config();
const app = express();

app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
 

const PORT = process.env.PORT || 5000;
app.listen(PORT ,() => {
    console.log(`Server is running on ${"http://localhost:3000"}`);
})

// Configuring Cloudinary 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let format = "";
    
    // MIME -> Multipurpose Internet Mail Extensions

    switch (file.mimetype) { 
      case "application/pdf": format = "pdf"; break;
      case "image/jpeg": format = "jpg"; break;
      case "image/png": format = "png"; break;
      default: format = undefined; 
    }

    return {
      folder: "uploads",
      resource_type: format === "pdf" ? "raw" : "auto", 
      public_id: file.originalname.replace(/\.[^/.]+$/, ""), 
      format: format, 
    };
  },
});

const upload = multer({ storage });


// Connecting to DB, creating a ODM of file using mongoose -> schema

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database successfully")
    } catch (error) {
        console.error('Connection to Database failed', error);
    }
};

connectDB();

const fileSchema = new mongoose.Schema({
    fileId: {
        type: String,
        required: true
    },
    fileURL: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiryTime: {
        type: Number,
        required: true
    },
    cloudinaryUrl: {
        type: String,
        required: true
    },
    isEncrypted: {
        type: Boolean,
        default: false,
    },
    password:{
        type: String,
        default: null,
    },
    count: {
        type: Number,
        required: true,
    },
    resourceType: {
        type: String,
        required: true,
    }
},{timestamps: true});

const File = mongoose.model('File',fileSchema);

// Upload route

app.post('/upload',upload.single('file'),async (req,res) => {
    try {
        const {expiryTime, password, count, isEncrypted} = req.body;
        const fileId = uuidv4();
        const resourceType = format === "pdf" ? "raw" : "image";
                
        let hashedPassword = null;        
        
        if(isEncrypted == false){
            if(!password){
                return res
                .status(400)
                .json({
                    message: "Password is required"
                })
            }

            hashedPassword = await bcrypt.hash(password,10);
        }

        const newFile = new File({
            fileId,
            size: req.file.size,
            fileName: req.file.originalname,
            fileURL: req.file.path,
            expiryTime: Number(expiryTime),
            cloudinaryUrl: req.file.path,
            password: hashedPassword,
            isEncrypted,
            count: Number(count),
            resourceType,
        })

        await newFile.save();
        
        return res
        .status(201)
        .json({
            message: "File uploaded successfully",
            link: `/file/${fileId}`,  
            isEncrypted: isEncrypted,          
        });
        
    } catch (error) {
        console.error(error);
        
        return res
        .status(500)
        .json({message: "Upload failed. Try again!!"})
    }
})

app.get('/file/:id',async (req,res) => {
    const file = await File.findOne({fileId: req.params.id});

    if(!file){
        return res
        .status(404)
        .json({message: "File not found"})
    }

    const expired = Date.now() > file.createdAt.getTime() + file.expiryTime*60*1000;

    return res
    .status(200)
    .json({
        fileName: file.fileName,
        size: file.size,
        isEncrypted: file.isEncrypted,
        expired: expired,
        link: `/downoladPage/${req.params.id}`, 
    })
})

app.post('/download/:id', async (req,res) => {
    try {
        console.log(req.params.id);
        const file = await File.findOne({fileId: req.params.id});
                
        if(!file){
            return res
            .status(404)
            .json({
                message: "File not found",
            });
        }

        const uploadedAt = file.createdAt.getTime();
        const expiresAt = uploadedAt + file.expiryTime * 60 * 1000;     
        
        if(file.isEncrypted){
            const {password} = req.body;

            if(!password){
                return res
                .status(400)
                .json({message: "Password required"})
            }

            const isMatch = await bcrypt.compare(password,file.password);

            if(!isMatch){
                return res
                .status(403)
                .json({message: "Incorrect password"})
            }
        }

        if(Date.now() > expiresAt){
            return res
            .status(410)
            .json({message: "The file link has expired"})
        }

        if(file.count == 0){
            return res
            .status(410)
            .json({message: "Maximum download count is reached"})
        }
        
        file.count = file.count - 1;
        await file.save();

         const downloadUrl = file.cloudinaryUrl.replace(
            '/upload/',
            '/upload/fl_attachment/'
        );

        console.log(file.cloudinaryUrl);
        
        return res
        .status(201)
        .json({ downloadURL: downloadUrl });
    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message: "Something went wrong while generating link. Try again"})
    }
})

cron.schedule("0 */6 * * *", async () => {
    console.log("Auto clean process initiating..." );

    const now = Date();
    const allFiles = await File.find({});

    for(const file of allFiles){
        const expiryTime = file.createdAt.getTime() + file.expiryTime;

        if(now > expiryTime){
            try {
                const parts = file.cloudinaryUrl.split('/upload/');   // details after /upload/ which has id + version details
                const id = parts[1].split(".")[0];  // This gives id with version 

                await cloudinary.uploader.destroy(id,{
                    resource_type: file.resourceType
                });

                await file.deleteOne({_id: file.id});
                console.log(`Deleted the expired file: ${file.fileName}`);                 
            } catch (error) {
                console.error(`Error deleting the expired file: ${file.fileName}`);
            }           
        }
    }    
});