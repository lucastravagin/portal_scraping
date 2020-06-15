const mongoose = require('mongoose');
mongoose.connect(`mongodb://gclaims:gclaims%402020@onpointcluster-shard-00-00-5nmlj.azure.mongodb.net:27017,onpointcluster-shard-00-01-5nmlj.azure.mongodb.net:27017,onpointcluster-shard-00-02-5nmlj.azure.mongodb.net:27017/cnep?ssl=true&replicaSet=OnPointCluster-shard-0&authSource=admin&retryWrites=true&w=majority`,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    


// Connect to mongo
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected');
});

const cnepSchema = new mongoose.Schema({
    cpfCnpj: String,
    nome: String,
    ufSancionado: String,
    orgao: String,
    razaoSocial: String,
    nomeFantasia: String,
    tipoSancao: String,
    dataInicialSancao: String,
    dataFinalSancao: String,
    valorMulta: String,
}, { collection: 'cnep' }
)

const ceisSchema = new mongoose.Schema({
    id: String,
    skPessoa: String,
    cpfCnpj: String,
    diferencaSignificativaNomeReceita: String,
    razaoSocial: String,
    nome: String,
    nomeFantasia: String,
    ufSancionado: String,
    tipoPessoa: String,
    dataInicialSancao: String,
    dataFinalSancao: String,
    dataPublicacao: String,
    idPoder: String,
    descricaoPoder: String,
    orgao: String,
    quantidade: String
}, { collection: 'ceis' }
)


const contratoSchema = new mongoose.Schema({
    orgao_superior_contratante: String,
    nome: String,
    ufSancionado: String,
    orgao: String,
    razaoSocial: String,
    nomeFantasia: String,
    tipoSancao: String,
    dataInicialSancao: String,
    dataFinalSancao: String,
    valorMulta: String,
}, { collection: 'contratos' }
)

module.exports = { Mongoose: mongoose, CnepSchema: cnepSchema, CeisSchema: ceisSchema , ContratoSchema: contratoSchema }
