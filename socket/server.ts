import { createServer } from 'http';
import { socketService } from '../src/lib/socket';
import { config } from 'dotenv';
import { join } from 'path';

// Load env vars from project root
config({ path: join(process.cwd(), '.env.local') });

const PORT = process.env.SOCKET_PORT || 3002;

const httpServer = createServer((req, res) => {
    // Basic health check
    if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
        return;
    }
    res.writeHead(200);
    res.end('Socket.io Server is running');
});

socketService.initialize(httpServer);

httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.io server running on http://localhost:${PORT}`);
});
