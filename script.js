import { prisma } from "./src/lib/prisma.js";

async function main() {
    await prisma.$connect();
    console.log("Connected to the database");

}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });