import { prisma } from '../lib/prisma.js';
import bcrypt from  'bcrypt';

const saltRounds = 10;

const password = 'testpassword';
const passwordHash = await bcrypt.hash(password, saltRounds);

const email = "test123@gmail.com";

// const user = await prisma.user.create({
//     data: {
//         email: email,
//         passwordHash: passwordHash,
//     }
    
// })

const user = await prisma.user.findUnique({
    where: {
        email: email
    }
});

console.log(user);

await prisma.$disconnect();