const main = require("./app");

main.init();
main.serviceRouter();
main.errorRouter();
main.serverStart();
