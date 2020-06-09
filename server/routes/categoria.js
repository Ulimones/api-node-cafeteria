const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();


let Categoria = require('../models/categoria.js');



app.get('/categoria', verificaToken, (req, res) => {

    // let desde = req.query.desde || 0;
    // desde = Number(desde);

    // let limite = req.query.limite || 100;
    // limite = Number(limite);


    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });

            });
        })

});


app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Categoria.findById(id)
        .exec((err, categoriaFind) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaFind) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'categoría no encontrada'
                    }
                });
            }

            res.json({
                ok: true,
                categoriaFind
            })
        })
});

//crear una nueva categoria
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    })


    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB,
        })
    });


});


app.put('/categoria/:id', (req, res) => {

    let id = req.params.id;
    let body = req.body;
    let desCate = {
        descripcion: body.descripcion
    };



    Categoria.findByIdAndUpdate(id, desCate, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // if (!categoriaDB) {
        //     return res.status(400).json({
        //         ok: false,
        //         err
        //     });
        // }

        res.json({
            id: true,
            categoria: categoriaDB
        });
    })

});


app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'categoría no encontrada'
                }
            })
        }

        res.json({
            ok: true,
            message: 'Categoria borrada',
            categoria: categoriaBorrada
        });

    });


});


module.exports = app;