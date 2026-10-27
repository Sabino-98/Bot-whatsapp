const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const NOME_GRUPO_ORIGEM = "Nome Do Grupo De Ofertas Original"; 
const ID_GRUPO_DESTINO = "120363000000000000@g.us"; 

const AFILIADOS_CONFIG = {
    amazonTag: "sua_tag_da_amazon-20",
    shopeeAppId: "sua_tag_da_shopee",
};

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code abaixo com o seu telemóvel:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo pronto! O bot está conectado e a vigiar as mensagens.');
});

client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();

        if (chat.isGroup && chat.name === NOME_GRUPO_ORIGEM) {
            let textoOriginal = msg.body;
            if (!textoOriginal) return;

            let textoModificado = processarLinks(textoOriginal);

            await client.sendMessage(ID_GRUPO_DESTINO, textoModificado);
            console.log(`[${new Date().toLocaleTimeString()}] Oferta clonada e enviada com sucesso!`);
        }
    } catch (error) {
        console.log("Erro ao processar mensagem:", error);
    }
});

function processarLinks(texto) {
    const regexUrl = /(https?:\/\/[^\s]+)/g;

    return texto.replace(regexUrl, (url) => {
        try {
            if (url.includes('amazon.com.br') || url.includes('amzn.to')) {
                const urlObj = new URL(url);
                urlObj.searchParams.set('tag', AFILIADOS_CONFIG.amazonTag);
                return urlObj.toString();
            }

            if (url.includes('shopee.com.br')) {
                const urlObj = new URL(url);
                urlObj.searchParams.set('utm_source', AFILIADOS_CONFIG.shopeeAppId);
                return urlObj.toString();
            }

            return url;
        } catch (err) {
            return url;
        }
    });
}

client.initialize();
