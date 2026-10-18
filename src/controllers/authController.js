import {prisma} from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';

export const registerUser = async (req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array(),})
        }

    try{
        const {email, password} = req.body;

        if( (!email) || (!password)){
            return res.status(400).json({error:'email or password missing'});
        }

        const saltRounds = 10; 
        const passwordHash = await bcrypt.hash(password, saltRounds)

        const user = await prisma.user.create({
            data: {
            email,
            passwordHash,}
            
        })
        
        return res.status(201).json({message: 'user created',user:{id: user.id, email: user.email, createdAt: user.createdAt,}})

    }catch(error){
        console.error('register failed', error);
        if(error.code === 'P2002'){
            return res.status(409).json({error:"Email already registered"});
        }
        return res.status(500).json({error: 'failed to register user'});
    }
}