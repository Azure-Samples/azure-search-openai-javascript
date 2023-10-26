import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { group, sleep } from 'k6';

const chatStreamLatency = new Trend('chat_stream_duration');
const chatNoStreamLatency = new Trend('chat_nostream_duration');

function between(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function choose(list) {
  return list[between(0, list.length)];
}

export function chat(baseUrl, stream = true) {
  group('Chat flow', function () {
    const defaultPrompts = [
      'How to search and book rentals?',
      'What is the refund policy?',
      'How to contact a representative?',
    ];

    const payload = JSON.stringify({
      messages: [{ content: choose(defaultPrompts), role: 'user' }],
      context: {
        retrieval_mode: 'hybrid',
        semantic_ranker: true,
        semantic_captions: false,
        suggest_followup_questions: true,
        retrievalMode: 'hybrid',
        top: 3,
        useSemanticRanker: true,
        useSemanticCaptions: false,
        excludeCategory: '',
        promptTemplate: '',
        promptTemplatePrefix: '',
        promptTemplateSuffix: '',
        suggestFollowupQuestions: true,
        approach: 'rrr',
      },
      stream,
    });

    const parameters = {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { type: 'API' },
    };

    const response = http.post(`${baseUrl}/chat`, payload, parameters);

    if (response.status !== 200) {
      console.log(`Response: ${response.status} ${response.body}`);
    }

    // add duration property to metric
    const latencyMetric = stream ? chatStreamLatency : chatNoStreamLatency;
    latencyMetric.add(response.timings.duration, { type: 'API' });

    sleep(between(5, 20)); // wait between 5 and 20 seconds between each user iteration
  });
}
