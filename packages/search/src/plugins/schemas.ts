import fp from 'fastify-plugin';

export const chatRequestSchema = {
  $id: 'chatRequest',
  type: 'object',
  properties: {
    messages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          bot: { type: 'string' },
          user: { type: 'string' },
        },
      },
    },
    stream: { type: 'boolean' },
    context: {
      type: 'object',
      properties: {
        approach: { type: 'string' },
      },
      additionalProperties: { type: 'string' },
    },
    session_state: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
  },
  required: ['messages'],
} as const;

export const askRequestSchema = {
  $id: 'askRequest',
  type: 'object',
  properties: {
    question: { type: 'string' },
    stream: { type: 'boolean' },
    context: {
      type: 'object',
      properties: {
        approach: { type: 'string' },
      },
      additionalProperties: { type: 'string' },
    },
    session_state: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
  },
  required: ['question'],
} as const;

export const approachResponseSchema = {
  $id: 'approachResponse',
  data_points: {
    type: 'array',
    items: { type: 'string' },
  },
  answer: { type: 'string' },
  thoughts: { type: 'string' },
  required: ['data_points', 'answer', 'thoughts'],
  additionalProperties: false,
} as const;

export const schemas = [chatRequestSchema, askRequestSchema, approachResponseSchema];

export type SchemaTypes = [typeof chatRequestSchema, typeof askRequestSchema, typeof approachResponseSchema];

export default fp(async (fastify, _options): Promise<void> => {
  for (const schema of schemas) {
    fastify.addSchema(schema);
  }
});
