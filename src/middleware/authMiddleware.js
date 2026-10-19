import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {

    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).json({
            error: 'Access token required'
        });
    }

    const parts = authHeader.split(' ');

    if(parts[0] !== 'Bearer' || !parts[1]){
        return res.status(401).json({
            error: "Invalid authorization header"
        });
    }

    const token = parts[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

    }catch(err){
        console.error(err);
        return res.status(401).json({error: 'invalid or expired token'});
    }

    next()
}