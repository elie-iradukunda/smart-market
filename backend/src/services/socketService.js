import { Server } from 'socket.io';

class SocketService {
  constructor() {
    this.io = null;
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return this.io;
  }

  emitPaymentCreated(paymentData) {
    if (this.io) {
      this.io.emit('payment:created', paymentData);
      console.log('Payment created event emitted:', paymentData.payment_id);
    }
  }

  emitPaymentUpdated(paymentData) {
    if (this.io) {
      this.io.emit('payment:updated', paymentData);
      console.log('Payment updated event emitted:', paymentData.payment_id);
    }
  }

  emitPaymentCompleted(paymentData) {
    if (this.io) {
      this.io.emit('payment:completed', paymentData);
      console.log('Payment completed event emitted:', paymentData.payment_id);
    }
  }

  emitPaymentFailed(paymentData) {
    if (this.io) {
      this.io.emit('payment:failed', paymentData);
      console.log('Payment failed event emitted:', paymentData.payment_id);
    }
  }
}

export default new SocketService();