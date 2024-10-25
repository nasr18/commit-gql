import mongoose from 'mongoose';

const { connect, connection, disconnect, set } = mongoose;

set('debug', process.env.DB_DEBUG)

connection
  .on('connected', () => {
    console.log('Mongoose connection established!');
  })
  .on('error', (err) => {
    console.error('Mongoose connection error:', err);
  })
  .on('disconnected', () => {
    console.warn('Mongoose connection disconnected');
  })
  .on('close', () => {
    console.log('Mongoose connection closed');
  });

export const doConnect = async () => {
  console.log('Establishing mongoose connection...');
  return connect(process.env.DB_URI);
};

export const doDisconnect = async () => {
  console.warn('disconnecting mongoose connection...');
  return disconnect();
};
