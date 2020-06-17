const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();

let producto = require('../models/producto.js');
const usuario = require('../models/usuario.js');

// default options
app.use(fileUpload());


app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado un archivo'
                }
            });
    }

    const tiposValidos = ['usuarios', 'productos'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(500).json({
            ok: false,
            err: {
                message: `Solo los tipos: ${tiposValidos.join(', ')} son aceptadas`
            }
        });
    }

    let archivo = req.files.archivoUp;

    const extencionesValidas = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg'];
    if (!extencionesValidas.includes(archivo.mimetype)) {
        return res.status(500).json({
            ok: false,
            err: {
                message: `Solo las extenciones ${extencionesValidas.join(', ')} son aceptadas`
            }
        });
    }


    exte = (archivo.mimetype).split('/')

    //cambiar nombre del archivo
    let nombreArchivo = `${id}.${exte[1]}`
        // let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${exte[1]}`
    console.log(nombreArchivo)
    archivo.mv(`upload/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).send(err);

        // return res.status(500).json({
        //     ok: true,
        //     message: `Archivo subido con exito`

        // });

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }


    });
});


function imagenUsuario(id, res, nombreArchivo) {
    usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios')
            return res.status(400).json({
                ok: false,
                err: { message: 'Usuario inexistente' }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios')

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioDB,
                img: nombreArchivo
            })

        })
    })
}


function imagenProducto(id, res, nombreArchivo) {
    producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos')
            return res.status(400).json({
                ok: false,
                err: { message: 'producto inexistente' }
            });
        }

        borraArchivo(productoDB.img, 'productos')

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoDB,
                img: nombreArchivo
            })

        })
    })
}



function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}


module.exports = app;