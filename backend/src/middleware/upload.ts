import multer from 'multer'
import path from 'path'

const MAX_SIZE = 10 * 1024 *1024 ;

const storage = multer.memoryStorage();

const fileFilter = (req :any , file: any , cb :any) =>{
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/jpg',
        "video/mp4",
        "application/pdf",
        "application/zip",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);

    }
};

export const upload = multer({
    storage,
    limits:{fieldSize:MAX_SIZE},
    fileFilter,
})
