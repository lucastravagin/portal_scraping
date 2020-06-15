const puppeter = require('puppeteer')
const app = require('express')()
const port = 3000
const _ = require('lodash')

app.listen(port, function () {
    console.log(`app listen on port ${port}`)
})


//'56679863000787'
const chromeOptions = {
    headless: true,
    defaultViewport: null,
    args: ['--no-sandbox'] 
};

app.get('/', async (req, res) => {
    try {
        var cnpj = req.query.cnpj

        const url = `http://www.portaltransparencia.gov.br/busca/pessoa-juridica/${cnpj}`
        await scrape(url).then((value) => {
            if (value == undefined) res.status(503).send({Erro: 'Instabilidade no portal da transparência'})
            res.status(200).json(value)
        })

    } catch (error) {
        console.log(error)
        res.status(404).json({ Erro: 'CNPJ não encontrado no portal da transparência' })
    }

})

let scrape = async (url) => {
    try {


        const browser = await puppeter.launch(chromeOptions)
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' })

        await page.setRequestInterception(true);
        await page.setDefaultNavigationTimeout(0); 

        //if the page makes a  request to a resource type of image then abort that request
        page.on('request', request => {
            if (request.resourceType() === 'image' || req.resourceType() === 'stylesheet')
                request.abort();
            else
                request.continue();
        });

        const result = await page.evaluate(() => {
            let registros = {}

            let cnpj = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(1) > div:nth-child(1) > span").innerText
            registros.cnpj = cnpj.substring(0, 18)
            registros.tipo = cnpj.substring(19)
            registros.data_abertura = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(1) > div:nth-child(2) > span").innerText
            registros.email = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(1) > div:nth-child(3) > span").innerText
            registros.telefone = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(1) > div.col-xs-12.col-sm-2 > span").innerText
            registros.razao_social = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(3) > div:nth-child(1) > span").innerText
            registros.nome_fantasia = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(3) > div:nth-child(2) > span").innerText
            registros.natureza_juridica = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(3) > div:nth-child(3) > span:nth-child(2)").innerText
            registros.atividade_principal = document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(3) > div:nth-child(4) > span").innerText

            registros.endereco = {
                logradouro: document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(5) > div.col-xs-12.col-sm-3 > span").innerText,
                numero: document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(5) > div:nth-child(2) > span").innerText,
                complemento: document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(5) > div:nth-child(3) > span").innerText,
                cep: document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(5) > div:nth-child(4) > span").innerText,
                bairro: document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(5) > div:nth-child(5) > span").innerText,
                municipio: document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(5) > div:nth-child(6) > span").innerText,
                uf: document.querySelector("body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(5) > div:nth-child(7) > span").innerText
            }

            return registros
        })


        const seletor = '#collapse-6 > div > table > tbody > tr'


        const socios = await page.$$eval(seletor, trs => trs.map(tr => {
            var objSocio = {}
            const tds = [...tr.getElementsByTagName('td')]
            objSocio.nome = tds[0].innerHTML.replace(/\n/gi, " ").trim()
            objSocio.cargo = tds[1].innerHTML.replace(/\n/gi, " ").trim()
            return objSocio
        }))


        const recursos_recebidos = await page.evaluate(() => {
            const element = document.getElementById('valoresRecebidos')
            if (element) return element.textContent.trim().substring(19).trim().replace(':', " ")
            return ''
        })

        const produtos_servicos_fornecidos = await page.evaluate(() => {
            obj_produtos = {}
            const element = document.getElementById('btnAbaProdutosEServicos')
            if (element) {
                obj_produtos.bens_patrimoniais = document.querySelector("#collapse-produtos-e-servicos > div.box-ficha__resultados > div:nth-child(1) > div:nth-child(1) > div > span").innerText
                obj_produtos.obras = document.querySelector("#collapse-produtos-e-servicos > div.box-ficha__resultados > div:nth-child(2) > div:nth-child(1) > div > span").innerText
                obj_produtos.outros = document.querySelector("#collapse-produtos-e-servicos > div.box-ficha__resultados > div:nth-child(3) > div:nth-child(1) > div > span").innerText
                obj_produtos.servicos = document.querySelector("#collapse-produtos-e-servicos > div.box-ficha__resultados > div:nth-child(1) > div:nth-child(2) > div > span").innerText
                obj_produtos.materiais = document.querySelector("#collapse-produtos-e-servicos > div.box-ficha__resultados > div:nth-child(2) > div:nth-child(2) > div > span").innerText
                return obj_produtos
            } else {
                return ''
            }
        })

        const seletor2 = '#listaParticipanteLicitacao > tbody > tr'

        const licitacoes = await page.$$eval(seletor2, trs => trs.map(tr => {
            var objLicitacoes = {}
            const tds = [...tr.getElementsByTagName('td')]
            objLicitacoes.orgao = tds[1].textContent.replace(/\n/gi, " ").trim()
            objLicitacoes.unidade_gestora_responsavel = tds[2].textContent.trim()
            objLicitacoes.numero_licitacao = tds[3].textContent.trim()
            objLicitacoes.data_abertura = tds[4].textContent.trim()
            return objLicitacoes
        }))

        browser.close()
        let resultadoFinal = Object.assign(result, { socios })

        return Object.assign(resultadoFinal, { recursos_recebidos: recursos_recebidos },
            { produtos_servicos_fornecidos: produtos_servicos_fornecidos }, { licitacoes: licitacoes })
    } catch (error) {
        return error
    }
}