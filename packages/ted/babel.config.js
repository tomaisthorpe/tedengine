const test = process.env.NODE_ENV === 'test';

module.exports = {
  plugins: [...(test ? ['babel-plugin-transform-import-meta'] : [])],
};
