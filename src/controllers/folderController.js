import {prisma} from '../lib/prisma.js';

export const createFolder = async (req, res) => {
    try{
        const {name, parentId} = req.body;

        if(!name){
            return res.status(400).json({error: 'folder name is required'});
        } 

        if(parentId){
            const parentFolder = await prisma.folder.findFirst({
                where:{
                    id: parentId, 
                    ownerId: req.user.userId,
                }
            })

            if(!parentFolder){
            return res.status(404).json({error: 'Parent folder not found'});
            }
        }

        const folder = await prisma.folder.create({
            data:{
                name,
                parentId: parentId || null,
                ownerId: req.user.userId,
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
                ownerId: req.user.userId,
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

export const deleteFolder = async(req, res) => {
    try{
        const folderID = req.params.id;
        const folder = await prisma.folder.findFirst({
            where:{
                id: folderID,
                ownerId: req.user.userId
            },
            include:{ //to check inside the folder, if its empty or not.
                files:true,
                children:true,
            }
        })
        if(!folder){
            return res.status(404).json({error: "folder not found"});
        }
        //check whether its empty
        if(folder.files.length > 0 || folder.children.length > 0){
            return res.status(409).json({error: 'folder is not empty'});
        }

        await prisma.folder.delete({
            where:{
                id:folderID,
            }
        }
        )

        return res.status(200).json({message: "folder deleted"});

    } catch(error){
        console.error("Failed to delete Folder", error);
        return res.status(500).json({error: "failed to delete folder"});
    }
}