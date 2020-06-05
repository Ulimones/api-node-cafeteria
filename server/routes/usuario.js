const express = require('express');
const Usuario = require('../models/usuario.js');
const bycry = require('bcrypt');
const _ = require('underscore');
const app = express();

app.get('/', function(req, res) {
    res.json('Hello World')
})

app.get('/usuario', function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    Usuario.find({ estado: true }, 'nombre email')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });



        })
})


app.post('/usuario', function(req, res) {
    // res.json('post user')
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bycry.hashSync(body.password, 6),
        rol: body.rol,
    })
    console.log(usuario)
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB,
        })
    });


    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     })

    // } else {
    //     res.json({ persona: body });
    //     // res.end(JSON.stringify(req.body, null, 2))        
    // }

})

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'rol', 'img', 'estado']);

    // delete body.password;
    // delete body.google;

    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            id: true,
            usuario: usuarioDB
        });


    })

})

app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let cambiarEstado = { estado: false };

    Usuario.findByIdAndUpdate(id, cambiarEstado, { new: true }, (err, usuarioBorrado) => {
        Usuario.estado = false;

        // Usuario.findByIdAndUpdate(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
})



module.exports = app;