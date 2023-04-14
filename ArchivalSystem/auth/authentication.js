const jwt = require('jsonwebtoken');

/*
function generateSecretToken(){
    return require('crypto').randomBytes(64).toString('hex')
}
*/

function verifyRoles(...allowedRoles){
        return(req,res,next)=>{
            if(!req?.role) return res.sendStatus(401)
            const rolesArray = [...allowedRoles]
            const result = rolesArray.includes(req.role)
            //console.log(`VerifyRoles: ${rolesArray}`)
            //console.log(`VerifyRoles: ${result}`)
            if(!result) return res.sendStatus(401)
            next()
        }
    }




function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

module.exports = {generateAccessToken,authenticateToken,verifyRoles}