require('dotenv').config();

const _ = require('lodash');
const { youdao, baidu, google } = require('translation.js');
const GphApiClient = require('giphy-js-sdk-core');

const client = GphApiClient(process.env.GIPHY_KEY);
const fastify = require('fastify')({
  logger: true,
});

fastify.get('/', async (request, reply) => {
  reply.redirect('https://github.com/kslr/bearychat-giphy');
});

fastify.post('/', async (request, reply) => {
  if (request.body.token === process.env.BEARTCHAT_TOKEN) {
    let keyword = _.replace(request.body.text, 'gify ', '');

    if (/[\u4e00-\u9FA5]+/.test(keyword)) {
      keyword = await google.translate({ text: keyword, to: 'en' })
        .then(response => response.result[0])
        .catch(err => request.log.error(err));
    }

    const gif = await client.search('gifs', { q: keyword, offset: _.random(0, 24) })
      .then(response => response.data[0].images.fixed_height.url)
      .catch(err => request.log.error(err));

    reply
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({
        attachments: [
          {
            images: [
              { url: gif },
            ],
          },
        ],
      });
  }
});

const start = async () => {
  try {
    await fastify.listen(8002, '0.0.0.0');
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
