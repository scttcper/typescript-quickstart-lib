module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: ['xo-space/esnext', 'xo-typescript', 'prettier', 'prettier/@typescript-eslint'],
  rules: {
    'object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 0,
  },
};
