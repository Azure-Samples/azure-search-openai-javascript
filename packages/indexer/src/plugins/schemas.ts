import fp from 'fastify-plugin';

// export const chatRequestSchema = {
//   $id: 'chatRequest',
//   type: 'object',
//   properties: {
//     approach: { type: 'string' },
//     history: {
//       type: 'array',
//       items: {
//         type: 'object',
//         properties: {
//           bot: { type: 'string' },
//           user: { type: 'string' },
//         },
//       },
//     },
//     overrides: {
//       type: 'object',
//       additionalProperties: { type: 'string' },
//     },
//   },
//   required: ['approach', 'history'],
// } as const;

// export const askRequestSchema = {
//   $id: 'askRequest',
//   type: 'object',
//   properties: {
//     approach: { type: 'string' },
//     question: { type: 'string' },
//     overrides: {
//       type: 'object',
//       additionalProperties: { type: 'string' },
//     },
//   },
//   required: ['approach', 'question'],
// } as const;

// export const approachResponseSchema = {
//   $id: 'approachResponse',
//   data_points: {
//     type: 'array',
//     items: { type: 'string' },
//   },
//   answer: { type: 'string' },
//   thoughts: { type: 'string' },
//   required: ['data_points', 'answer', 'thoughts'],
//   additionalProperties: false,
// } as const;

export const schemas = [];

// export type SchemaTypes = [typeof chatRequestSchema, typeof askRequestSchema, typeof approachResponseSchema];

export default fp(async (fastify, _options): Promise<void> => {
  for (const schema of schemas) {
    fastify.addSchema(schema);
  }
});
