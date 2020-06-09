const express = require('express');
const _ = require('underscore');
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
let Producto = require('../models/producto.js');

const app = express();




//###################### Obtener todos los productos //######################
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);


    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });

            });
        })

});



//###################### Obtener un producto //######################
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;


    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'el id no existe'
                    }
                });
            }


            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }



            Producto.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });

            });
        })

});



//###################### Buscar un producto //######################
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');


    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encontró lo que buscabas'
                    }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        })

});



//###################### Agregar un nuevo producto  //######################
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;


    // console.log('hola' + body);
    console.log(body)
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id,
    })


    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            producto: productoDB,
        })
    });


});



//###################### Editar un producto //######################
app.put('/producto/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let datosActualizar = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
    };

    Producto.findByIdAndUpdate(id, datosActualizar, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            id: true,
            producto: productoDB
        });
    })

});


app.delete('/producto/:id', (req, res) => {
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'id no existe'
                }
            });
        }
        productoDB.disponible = false;
        productoDB.save((err, borrado) => {


            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
                message: 'producto borrado'
            });


        })


    })

});




module.exports = app;