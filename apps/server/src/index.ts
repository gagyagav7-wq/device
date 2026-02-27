import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';

const fastify = Fastify({ logger: false });
const PORT = 8787;
const TOKEN = process.env.DASH_TOKEN || 'super_secret_poco_token_123';

fastify.register(cors, { origin: '*' });
fastify.register(fastifyWebsocket);

// Setup biar nampilin folder web Frontend
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../../web/dist'),
  prefix: '/',
});

let latestSnapshot: any = null;

fastify.post('/ingest', async (request, reply) => {
  if (request.headers.authorization !== `Bearer ${TOKEN}`) return reply.code(401).send({ error: 'Unauthorized' });
  latestSnapshot = request.body;
  fastify.websocketServer.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify({ type: 'metrics:update', data: latestSnapshot }));
  });
  return { success: true };
});

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const token = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('token');
    if (token !== TOKEN) return connection.socket.close();
    if (latestSnapshot) connection.socket.send(JSON.stringify({ type: 'metrics:update', data: latestSnapshot }));
  });
});

fastify.listen({ port: PORT, host: '0.0.0.0' }, () => console.log(`[SERVER] Jalan di http://0.0.0.0:${PORT}`));
