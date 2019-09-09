require('dotenv').config();
import { app } from './app';

const port = process.env.NATOURS_PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
