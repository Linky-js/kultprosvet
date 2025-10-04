const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();

const config = {
  user: "u2326060",
  password: "5WknleS287QFED6m",
  host: "31.31.198.55",
  port: 21,
  localRoot: __dirname + "/dist", // Путь до собранных файлов
  remoteRoot: "/www/xn--b1agnepfhjfgc3i.fun", // Путь на сервере
  include: ["*", "**/*"], // Файлы для загрузки
  deleteRemote: false, // Очищать старые файлы
  forcePasv: true,
};

ftpDeploy
  .deploy(config)
  .then(() => console.log("Deployment finished"))
  .catch((err) => console.error(err));