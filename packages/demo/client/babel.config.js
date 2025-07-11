module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@backend': '../backend',
            '@babel/runtime': './node_modules/@babel/runtime',
            '@': './src'
          },
          root: ['./src'],
        },
      ],
    ],
  };
};