export default {
  eslint: [
    {
      template: '@saashub/qoq-eslint-v9-ts',
      files: [
        'src/**/*.{js,ts}'
      ],
      ignores: [
        '**/*.spec.{js,ts}'
      ],
      rules: {
        'no-redeclare': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/ban-ts-comment': 0
      }
    },
    {
      template: '@saashub/qoq-eslint-v9-ts-vitest',
      files: [
        'src/**/*.spec.{js,ts}'
      ],
    }
  ]
}