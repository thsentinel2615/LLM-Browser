import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import { Configuration, OpenAIApi } from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
});

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: storage });

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    app.get('/', async (req, res) => {
      const viteServer = await createServer();
      const url = viteServer.url;
  
      res.redirect(url);
    });
  }
  
let up = 'uploads/';

// Check if the directory exists
if (!fs.existsSync(up)) {
    // Create the directory
    fs.mkdirSync(up);
}

// Signal handling
process.on('SIGINT', () => {
    console.log('Closing server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
});
  
process.on('SIGTERM', () => {
    console.log('Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});