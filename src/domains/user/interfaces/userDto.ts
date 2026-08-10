export type UpdateUserGenderAgeRequest = {
  gender: 'MALE' | 'FEMALE';
  ageGroup: 'TEENS' | 'TWENTIES' | 'THIRTIES' | 'FORTIES' | 'FIFTIES_PLUS';
};

export const updateUserGenderAgeRequestSchema = {
  gender: {
    type: 'string',
    required: true,
    allowableValues: ['MALE', 'FEMALE']
  },
  ageGroup: {
    type: 'string',
    required: true,
    allowableValues: ['TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES_PLUS']
  }
} as const;

export type UpdateUserNameMotivRequest = {
  name?: string;
  motivation?: string;
};

export const updateUserNameMotivRequestSchema = {
  name: {
    type: 'string',
    required: false,
    minLength: 1
  },
  motivation: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100
  }
} as const;
