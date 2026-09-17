import dotenv from 'dotenv';
import { compositionRoot } from './CompositionRoot';

dotenv.config();

const port = process.env.PORT || 3000;

compositionRoot.app.listen(port, () => {
  console.log(`Servidor de Citas Médicas escuchando en http://localhost:${port}`);
});

