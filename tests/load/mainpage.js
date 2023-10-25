import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { group, sleep } from 'k6';

const mainpageLatency = new Trend('mainpage_duration');

export function mainpage(baseUrl) {
  group('Mainpage', function () {
    // save response as variable
    const response = http.get(`${baseUrl}`, { tags: { type: 'content' } });
    // add duration property to metric
    mainpageLatency.add(response.timings.duration, { type: 'content' });
    sleep(1);
  });
}
