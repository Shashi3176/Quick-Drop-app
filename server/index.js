import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import {v2 as cloudinary} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import mongoose, { mongo } from 'mongoose';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

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
},{timestamps: true});

const File = mongoose.model('File',fileSchema);

// Upload route

app.post('/upload',upload.single('file'),async (req,res) => {
    console.log("REQ.FILE:", req.file);
    console.log("REQ.BODY:", req.body);   
    try {
        const {expiryTime} = req.body;
        const fileId = uuidv4();

        const newFile = new File({
            fileId,
            fileName: req.file.originalname,
            fileURL: req.file.path,
            size: req.file.size,
            expiryTime: Number(expiryTime),
            cloudinaryUrl: req.file.path
        })

        await newFile.save();
        console.log(req.file);
        
        return res
        .status(201)
        .json({
            message: "File uploaded successfully",
            link: `/download/${fileId}`,            
        });
        
    } catch (error) {
        console.error(error);
        
        return res
        .status(500)
        .json({message: "Upload failed. Try again!!"})
    }
})

app.get('/download/:id', async (req,res) => {
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

        if(Date.now() > expiresAt){
            return res
            .status(410)
            .json({message: "The file link has expired"})
        }
        
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
