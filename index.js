const app = require('./app');

var port = process.env.PORT || 8092;

app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
})