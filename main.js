const app = require('express')()
const db = require('./config/db')
const adicionaMascara = require('./config/util')

const port = 3000


app.listen(port, () => {
    console.log(`app listen on port ${port}`)
})



app.get('/naturezaJuridica', async (req, res, next) => {
    try {
        let listNaturezaJuridica = await getNatureza_Juridica()
        res.status(200).send(listNaturezaJuridica)
    } catch (error) {
        res.status(404).send(error)
    }
})

app.get('/', async function (req, res, next) {
    try {
        let cnpj = req.query.cnpj
        let cnpjFormatado = await adicionaMascara.adicionaMascara(cnpj)

        let cnep = await getCNEP(cnpjFormatado)
        let ceis = await getCEIS(cnpjFormatado)
        let contratos = await getContratos(cnpjFormatado)

        if (!cnep) {
            cnep = false
            cadastradoCnep = false
        } else {
            cnep = cnep
            cadastradoCnep = true
        }
        if (!ceis) {
            ceis = false
            cadastradoCeis = false
        } else {
            cadastrado = cnep
            cadastradoCeis = true
        }

  
        if (contratos.length == 0) {
            contratos = false
            cadastradoContratos = false
        } else {
            cadastrado = contratos
            cadastradoContratos = true
        }

        let result = {}
        result = Object.assign(
            { cnep: { cadastrado: cadastradoCnep, ...cnep } },
            { ceis: { cadastrado: cadastradoCeis, ...ceis } },
            { contratos: { possui_contratos: cadastradoContratos ,...contratos }}
             )
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

const getNatureza_Juridica = () => {
    return new Promise((resolve, reject) => {
        let NaturezaJuridica = db.Mongoose.model('natureza_juridica', db.NaturezaJuridicaSchema)
        NaturezaJuridica.find({}).lean().exec((e, docs) => {
            if (e) return reject(err)
            try {
                resolve(docs)
            } catch (error) {
                reject(error)
            }
        })
    })
}

const getContratos = (cnpj) => {
    return new Promise((resolve, reject) => {
        let Contratos = db.Mongoose.model('contratos', db.ContratoSchema)
        Contratos.find({ cpfCnpjFornecedor: cnpj }).lean().exec((e, docs) => {
            if (e) return reject(err)
            try {
                resolve(docs)
            } catch (error) {
                reject(error)
            }
        })
    })
}








