import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { group, sleep } from 'k6';

const chatLatency = new Trend('chat_duration');

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
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

    // add duration property to metric
    chatLatency.add(response.timings.duration, { type: 'API' });
    sleep(1);
  });
}
