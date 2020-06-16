const app = require('express')()
const db = require('./config/db')
const adicionaMascara = require('./config/util')
const port = 3000


app.listen(port, () => {
    console.log(`app listen on port ${port}`)
})


app.get('/', async function (req, res, next) {
    try {
        let cnpj = req.query.cnpj
        let cnpjFormatado = await adicionaMascara.adicionaMascara(cnpj)

        let cnep = await getCNEP(cnpjFormatado)
        let ceis = await getCEIS(cnpjFormatado)

    
        if(!cnep) {
            cnep = false
            cadastrado = false
        } else {
            cnep = cnep
            cadastrado = true
        }
        if(!ceis) {
            ceis = false
            cadastrado = false
        } else {
            cadastrado = cnep
            cadastrado = true
        }

        let result = []
        result.push([cnep = { cadastrado: cadastrado , cnep: cnep}], [ceis = { cadastrado: cadastrado, ceis: ceis }])
        res.status(200).send(result)
    } catch (error) {
        res.status(404).send(error)
    }
})


const getCNEP = (cnpj) => {
    return new Promise((resolve, reject) => {
        let Cnep = db.Mongoose.model('cnep', db.CnepSchema)
        Cnep.findOne({ cpfCnpj: cnpj }).lean().exec((e, docs) => {
            if (e) return reject(err)
            try {
                resolve(docs)
            } catch (error) {
                reject(error)
            }
        })
    })
}

const getCEIS = (cnpj) => {
    return new Promise((resolve, reject) => {
        let Ceis = db.Mongoose.model('ceis', db.CeisSchema)
        Ceis.findOne({ cpfCnpj: cnpj }).lean().exec((e, docs) => {
            if (e) return reject(err)
            try {
                resolve(docs)
            } catch (error) {
                reject(error)
            }
        })
    })
}



// const getReceita = (cnpj) => {
//     let optionsCNPJ = {
//         'method': 'GET',
//         'url': `https://receita-federal-api-hml.gclaims.com.br/?cnpj=${cnpj}`
//     }
//     return new Promise((resolve, reject) => {
//         request(optionsCNPJ, (error, response) => {
//             if (error) return reject(err);
//             try {
//                 resolve(response.body)
//             } catch (error) {
//                 reject(error)
//             }
//         })
//     })
// }






