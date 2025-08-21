/**
 * Starts the application on the port specified.
 */
require('dotenv').config();

import _ from './services/_'; _();
import api from './api';
import { initializeServices, shutdownServices } from './services';

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Initialize Redis and Kafka services
    await initializeServices({
      language: process.env.DEFAULT_LANGUAGE || 'en',
      currentUser: null,
      currentTenant: null,
      database: null,
      req: null,
    });

    // Start the Express server
    const server = api.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
      console.log(`📖 API documentation at http://localhost:${PORT}/api/documentation`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await shutdownServices();
          console.log('All services shut down successfully');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close server after 30 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
