const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    console.log(app);
    app.use(
        "/api",
        createProxyMiddleware({
            target: "https://baike.baidu.com",
            changeOrigin: true,

        })
    );
};
