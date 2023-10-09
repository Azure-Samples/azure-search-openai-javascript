import t from 'tap';
import { build } from '../helper.js';

t.test('default root route', async (t) => {
  const app = await build(t);
  const response = await app.inject({
    url: '/',
  });

  const result = JSON.parse(response.payload);
  t.hasProps(result, ['service', 'description', 'version']);
});

// t.test('/chat without streaming', async (t) => {
//   t.nock.snapshot();

//   const app = await build(t);
//   const response = await app.inject({
//     url: '/chat',
//     method: 'POST',
//     payload: {
//       history: [{ user: "What happens if a rental doesn't fit the description?" }],
//       approach: 'rrr',
//       overrides: {
//         retrieval_mode: 'hybrid',
//         semantic_ranker: true,
//         semantic_captions: false,
//         top: 3,
//         suggest_followup_questions: false,
//       },
//     },
//   });

//   const result = JSON.parse(response.payload);
//   t.matchSnapshot(result);
// });
