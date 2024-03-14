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
          content: { type: 'string' },
          // can be only: assistant, user, system
          role: {
            type: 'string',
            enum: ['system', 'user', 'assistant'],
          },
        },
        required: ['content', 'role'],
        additionalProperties: false,
      },
    },
    stream: { type: 'boolean' },
    context: {
      type: 'object',
      properties: {
        approach: { type: 'string' },
        retrieval_mode: {
          type: 'string',
          enum: ['hybrid', 'text', 'vectors'],
        },
        semantic_ranker: { type: 'boolean' },
        semantic_captions: { type: 'boolean' },
        top: { type: 'number' },
        temperature: { type: 'number' },
        exclude_category: { type: 'string' },
        prompt_template: { type: 'string' },
        prompt_template_prefix: { type: 'string' },
        prompt_template_suffix: { type: 'string' },
        suggest_followup_questions: { type: 'boolean' },
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

export const messageSchema = {
  $id: 'message',
  type: 'object',
  properties: {
    content: { type: 'string' },
    role: { type: 'string' },
    context: {
      type: 'object',
      properties: {
        data_points: {
          type: 'object',
          properties: {
            text: {
              type: 'array',
              items: { type: 'string' },
            },
            images: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        thoughts: { type: 'string' },
      },
      additionalProperties: true,
    },
    session_state: {
      type: 'object',
      additionalProperties: true,
    },
  },
  required: ['content', 'role'],
  additionalProperties: false,
} as const;

export const approachResponseSchema = {
  $id: 'approachResponse',
  type: 'object',
  properties: {
    choices: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'number' },
          message: { $ref: 'message' },
        },
        required: ['index', 'message'],
        additionalProperties: false,
      },
    },
    object: { type: 'string' },
  },
  required: ['choices', 'object'],
} as const;

export const schemas = [chatRequestSchema, messageSchema, approachResponseSchema];

export type SchemaTypes = [typeof chatRequestSchema, typeof messageSchema, typeof approachResponseSchema];

export default fp(async (fastify, _options): Promise<void> => {
  for (const schema of schemas) {
    fastify.addSchema(schema);
  }
});
