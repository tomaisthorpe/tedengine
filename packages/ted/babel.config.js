const test = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, loose: true }],
    [
      '@babel/preset-react',
      { runtime: 'automatic', development: test, useBuiltIns: true },
    ],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ],
  plugins: [...(test ? ['babel-plugin-transform-import-meta'] : [])],
};
