import { GoogleGenAI } from '@google/genai';
const genAI = new GoogleGenAI({ apiKey: 'AIzaSyCfoijVUGikP6rNsM40Qm0NVtTvdlyxn1Q' });
genAI.models.list().then(m => {
  console.log('Available models:');
  m.forEach(model => console.log(model.name));
}).catch(e => console.error(e));
