const redis = require('redis')

//10 requests per 10 sec
const redisClient = redis.createClient();
const WINDO_SIZE_IN_SECONDS = 10;
const MAX_COUNT = 10;



const rateLimiter = (req,res,next) => {
 
    redisClient.get(req.ip,(err,record)=>{
        if(err) throw err;
        //no record
        if(record == null){
            let token = MAX_COUNT-1;

            //redis set cache with key of ip address of the request and expires
            //in window of time
            redisClient.setex(req.ip,WINDO_SIZE_IN_SECONDS,token)
            next();
        }

        //if there is record
        //check if the token are all used
        let remainToken = record;
        console.log(remainToken)
        if(remainToken > 0)
        {
            //decrease token by 1 keep the TTL for that bucket
            redisClient.decrby(req.ip,1);
            next();
        }

        if(remainToken == 0){
            res.status(429).send("request blocked due to traffic")
        }
    })
}

module.exports = {rateLimiter}