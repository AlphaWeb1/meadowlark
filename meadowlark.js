/* Node libraries init */
const express = require('express'), 
    handlebars = require('express-handlebars');
    /* var handlebars = require('express3-handlebars').create({ defaultLayout:'main' }); // alternatively */

    /* initialize express */
    let app = express();
    app.set('port', process.env.PORT || 3000);

    /* Setup handlebar engine*/
    app.engine('handlebars', handlebars());
    app.set('view engine', 'handlebars');

    /* Global paths or directories */
    app.use(express.static(`${__dirname}/public`));

    /* Data Declaration */
    const fortunes = [
        "Conquer your fears or they will conquer you.",
        "Rivers need springs.",
        "Do not fear what you don't know.",
        "You will have a pleasant surprise.",
        "Whenever possible, keep it simple.",
    ];

    /* Global Variables */
    handlebars.create({
        // Specify helpers which are only registered on this instance.
        helpers: {
            title: _=> 'Meadowlark Travel'
        }
    });

    /* Define Routes */
    app.get(['/', '/home'], (req, res) => {
        res.render('home', {
            helpers: {
                title: _=> 'Meadowlark Travel: Home'
            }
        });
    }); // home route
    
    app.get('/about', (req, res) => {
        res.render('about', {
            helpers: {
                title: _=> 'Meadowlark Travel: About'
            },
            note: {
                paragraph1: `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam laborum iusto quasi animi voluptatibus sunt. 
                Quis aut inventore totam sequi ullam incidunt reprehenderit, illum sed ipsum repudiandae quaerat expedita possimus?`
            }
        });
    }); // about route

    app.get('/tell-fortune', (req, res) => {
        randomFortune = fortunes[ Math.floor(Math.random() * fortunes.length)];
        res.render('fortune', {
            helpers: {
                title: _=> 'Meadowlark Travel: Fortune Teller'
            },
            fortune: randomFortune
        });
    }); // fortune route

    /* Error Validation Middlewares */
    app.use((req, res) => {
        res.status(404);
        res.render('exceptions/404', {
            helpers: {
                title: _=> 'Meadowlark Travel: 404'
            }
        });
    }); // custom 404 page
    
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500);
        res.render('exceptions/500', {
            helpers: {
                title: _=> 'Meadowlark Travel: 500'
            }
        });
    }); // custom 500 page
    
    const appPort = app.get('port');
    app.listen(appPort, () => {
        console.log( `Express started on http://localhost:${appPort}; press Ctrl + C to terminate.` );
    });
