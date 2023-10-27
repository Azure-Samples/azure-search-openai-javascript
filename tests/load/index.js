import { mainpage } from './mainpage.js';
import { chat } from './chat.js';
import { thresholdsSettings, standardWorkload } from './config.js';

export const options = {
  scenarios: {
    staged: standardWorkload,
  },
  thresholds: thresholdsSettings,
};

const webappUrl = __ENV.WEBAPP_URI;
const searchUrl = __ENV.SEARCH_API_URI;

export default function () {
  mainpage(webappUrl);
  chat(searchUrl, true);
  //chat(searchUrl, false);
}
