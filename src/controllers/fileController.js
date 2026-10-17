import {prisma} from '../lib/prisma.js';
import path from 'node:path';


export const getFiles = async (req, res) => {
    try{
        const files = await prisma.file.findMany({
            where: {
                ownerId: "cmv581r2b0000tgtwl918ug7r",
            }
        });

        return res.status(200).json({
            message: 'files retrieved successfully',files,
        });

    } catch(error){
        console.error("Failed to retrieve files:", error);
        return res.status(500).json({error:'failed to retrieve files'});
}
};

export const downloadFile = async(req, res) => {
    try{
        
        const fileID = req.params.id;
        
        const file = await prisma.file.findUnique({
            where:{
                id: fileID,
            }
        })

        if(!file){            
            return res.status(404).json({error:'file not found'});
        }

        const filePath = path.resolve("uploads", file.storageName);
        return res.download(filePath, file.filename);


    } catch(error){
        console.error("Failed to download file:", error);
        return res.status(500).json({error:'failed to download file'});
    }
} 