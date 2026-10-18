import {prisma} from '../lib/prisma.js';

export const createFolder = async (req, res) => {
    try{
        const {name, parentId} = req.body;

        if(!name){
            return res.status(400).json({error: 'folder name is required'});
        } 

        const folder = await prisma.folder.create({
            data:{
                name,
                parentId: parentId || null,
                ownerId: "cmv581r2b0000tgtwl918ug7r",
            }
        })
        return res.status(201).json({message: 'folder created successfully', folder});
    } catch(error){
        console.error("Failed to create Folder", error);
        return res.status(500).json({error: 'failed to create folder'});
    }
}

export const getFolders = async (req, res) => {
    try{
        const folders  = await prisma.folder.findMany({
            where:{
                ownerId: "cmv581r2b0000tgtwl918ug7r"
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return res.status(200).json({folders});

    }catch(error){
        console.error("Failed to get Folders", error);
        return res.status(500).json({error:'failed to get folders'});
    }
}