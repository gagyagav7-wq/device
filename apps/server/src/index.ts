import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });
const TOKEN = process.env.DASH_TOKEN || 'super_secret_poco_token_123';
const PORT = parseInt(process.env.PORT || '8787');
const HOST = process.env.EXPOSE_LAN === 'true' ? '0.0.0.0' : '127.0.0.1';

fastify.register(cors, { origin: '*' });
fastify.register(fastifyWebsocket);

// In-memory store (Ring Buffer for Sparkline)
const HISTORY_LIMIT = 30; // 60 seconds at 2s interval
const history: any[] = [];
let latestSnapshot: any = null;

// Auth Middleware
fastify.decorateRequest('verifyToken', async function (request, reply) {
  const auth = request.headers.authorization;
  if (!auth || auth !== `Bearer ${TOKEN}`) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

fastify.post('/ingest', { preHandler: [(fastify as any).verifyToken] }, async (request, reply) => {
  const data = request.body;
  latestSnapshot = data;
  
  history.push(data);
  if (history.length > HISTORY_LIMIT) history.shift();

  // Broadcast to WS clients
  fastify.websocketServer.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'metrics:update', data: latestSnapshot, history }));
    }
  });

  return { success: true };
});

fastify.get('/api/snapshot', { preHandler: [(fastify as any).verifyToken] }, async () => {
  return { data: latestSnapshot, history };
});

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    // Simple WS URL token auth: ws://...?token=xxx
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (token !== TOKEN) {
      connection.socket.close();
      return;
    }
    
    // Send initial state
    if (latestSnapshot) {
      connection.socket.send(JSON.stringify({ type: 'metrics:update', data: latestSnapshot, history }));
    }
  });
});

fastify.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
