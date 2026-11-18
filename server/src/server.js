const app = require('./app');
const { connectDatabase, disconnectDatabase } = require('./db');
const { port, mongoUri } = require('./config');

async function start() {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB.');

    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    server.on('error', (error) => {
      console.error('Server failed to start:', error.message);
      process.exit(1);
    });

    let shuttingDown = false;
    const shutdown = async (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`${signal} received. Shutting down...`);

      const forceExit = setTimeout(() => {
        console.error('Shutdown timed out.');
        process.exit(1);
      }, 10000);
      forceExit.unref();

      server.close(async () => {
        await disconnectDatabase();
        clearTimeout(forceExit);
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start the application:', error.message);
    if (mongoUri.startsWith('mongodb://127.0.0.1') || mongoUri.startsWith('mongodb://localhost')) {
      console.error(
        'Make sure MongoDB Community Edition is running locally on port 27017.'
      );
    }
    process.exit(1);
  }
}

start();
