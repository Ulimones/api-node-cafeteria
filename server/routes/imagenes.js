const express = require('express');
const fs = require('fs');
const path = require('path');
let app = express();


app.get('/imagen/:tipo/:img', (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../upload/${ tipo }/${ img }`);
    console.log(pathImagen)
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen)
    } else {
        let noImg = path.resolve(__dirname, '../assets/no-image.jpg')
        res.sendFile(noImg)
    }


})



app.get('/imagen/:tipo/:img', (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = `./uploads/${tipo}/${img}`
    let noImg = path.resolve(__dirname, '../assets/no-image.jpg')
    res.sendFile(noImg)
})
module.exports = app;