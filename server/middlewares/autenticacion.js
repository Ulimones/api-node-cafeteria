const jwt = require('jsonwebtoken');

// Verificar Token
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Tu token es invalido...'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
    // res.json({
    //     token: token
    // });
};



//Verificar rol admin
let verificaAdmin_Role = (req, res, next) => {

    let token = req.get('token');
    let usuario = req.usuario;

    if (usuario.rol === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Lo siento no eres admin.'
            }
        });
    }
};


module.exports = {
    verificaToken,
    verificaAdmin_Role
}