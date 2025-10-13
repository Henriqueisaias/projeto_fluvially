import mongoose from 'mongoose';

const connect = async () => {
  try {
   
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log(`Erro ao conectar: ${err}`);
  }
};

export { connect };