export type UpdateUserGenderAgeRequest = {
  gender: 'MALE' | 'FEMALE';
  ageGroup: 'TEENS' | 'TWENTIES' | 'THIRTIES' | 'FORTIES' | 'FIFTIES_PLUS';
};

export const updateUserGenderAgeRequestSchema = {
  gender: {
    type: 'string',
    required: true
  },
  ageGroup: {
    type: 'string',
    required: true
  }
} as const;
