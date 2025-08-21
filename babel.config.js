module.exports = function (api) {
  api.cache(true);

  // Pega a env passada no script (se não passar, cai no .env padrão)
  const envFile = process.env.ENVFILE || '.env';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: envFile,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
