const Config = {
  SERVER_URI: import.meta.env.PROD ? "" : "https://solodb-onelab.docker.localhost",
};

export default Config;
