/* Node libraries init */
const express = require('express'), 
    handlebars = require('express-handlebars'), 
    // approutes = require('./app-routing.js'),
    fortune = require('./lib/fortune.js'),
    weather = require('./lib/weather.js');
    /* var handlebars = require('express3-handlebars').create({ defaultLayout:'main' }); // alternatively */

    /* initialize express */
    let app = express();
    app.use(express.urlencoded({ extended: false }));
    // app.use(express.bodyParser()); // to override get post method
    // app.use(express.methodOverride()); // to override get post method
    app.set('port', process.env.PORT || 3000);

    /* Setup handlebar engine*/
    app.engine('handlebars', handlebars());
    app.set('view engine', 'handlebars');

    /* Global paths or directories */
    app.use(express.static(`${__dirname}/public`));

    /* Global Variables */
    handlebars.create({
        // Specify helpers which are only registered on this instance.
        defaultLayout:'main',
        helpers: {
            title: _=> 'Meadowlark Travel',
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            },
            weather: _=> weather.getWeathers(),
        }
    });

    /* Pre Middlewares*/ 
    app.use((req, res, next)=> {
        /* Test Global */
        res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
        next();
    });

    /* Deafault Response Headers Config */
    app.disable('x-powered-by'); // disabling express's default header

    /* Define Routes */
    app.get('/test-jquery', (req, res) => {
        res.render('jquery-test');
    });

    app.get('/headers', function(req,res){
        res.set('Content-Type','text/plain');
        var s = ``;
        for(var name in req.headers) s = `${s}${name}: ${req.headers[name]} \n`;
        res.send(s);
    }); // showing request header information


    app.use((req, res, next)=> {
        /* Weather Global */
        if(!res.locals.partials) res.locals.partials = {};
        // res.locals.partials.weather = weather.getWeathers();
        
        next();
    }); // weather widget middleware
    app.get(['/', '/home'], (req, res) => {
        res.render('home', {
            helpers: {
                title: _=> 'Meadowlark Travel: Home',
                // weather: _=> weather.getWeathers(),
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
            },
            pageTestScript: '/qa/tests-about.js'
        });
    }); // about route

    app.get('/tell-fortune', (req, res) => {
        fortune.addFortune("The tunnel is full of sparkling light, just a little hold");
        res.render('fortune', {
            helpers: {
                title: _=> 'Meadowlark Travel: Fortune Teller'
            },
            fortune: fortune.getFortune(), 
            // style: req.query.style,
            // userid: req.cookies.userid,
            // username: req.session.username
        }); // passing context to a view including querystrings, cookies, & sessions
    }); // fortune route

    app.get('/tours/hood-river', function(req, res){
        res.render('tours/hood-river');
    }); // hood river route

    app.get('/tours/request-group-rate', function(req, res){
        res.render('tours/request-group-rate');
    }); // request group rate route

    app.get('/contact', (req, res) => {
        res.render('contact', {
            helpers: {
                title: _=> 'Meadowlark Travel: Contact'
            },
            note: {
                note1: `For more enquiry, you can drop us a message using the form below`
            }
        });
    }); // contact route

    app.get('/thank-you', (req, res) => {
        res.render('thank-you', {
            helpers: {
                title: _=> 'Meadowlark Travel: Contact Response'
            },
            note: {
                note1: `Thank your for dropping a message, we will reachout shortly`
            }
        });
    }); // contact route
    
    app.get('/tours', (req, res) => {
        res.render('tours/tours', {
            helpers: {
                title: _=> 'Meadowlark Travel: Tours'
            },
            tours
        });
    }); // list of tours

    app.get('/tour/edit/:id', (req, res)=>{
        let tour = tours.find((tour) => { return tour.id == req.params.id});
        res.render('tours/edit-tour', {tour});
    }); // edit a tour form
    
    app.put('/tour/:id', (req, res) => {
        let tour = tours.find(tour => (tour.id == req.params.id));
        if( tour ) {
            tour.name = req.query.name ? req.query.name : tour.name;
            tour.price = req.query.price ? req.query.price : tour.price;
            // res.json({success: true, code: 200, data: tour}); // change response
            res.redirect(303, '/tours', {message: 'selected tour updated successfully', success: true});
        } else {
            // res.json({error: true, message: 'No such tour exists.', code: 401, data: null}); // change response
            res.redirect(303, '/tours', {message: 'no such tour exist', success: false});
        }
    }); // update a tour

    app.delete('/tour/:id', function(req, res){
        let tourIdx = tours.findIndex(p => p.id == req.params.id);
        if (tourIdx >= 0){
            tours.splice(tourIdx, 1);
            res.redirect(303, '/tours', {message: 'selected tour deleted successfully', success: true});
        } else {
            res.redirect(303, '/tours', {message: 'no such tour exist', success: false});
        }
        
    }); // delete a tour

    /* Processing forms */
    app.post('/process-contact', (req, res) => {
        console.log(`Received contact from ${req.body.name } <${req.body.email}>`);
        console.log(req.body.message);
        try {
            // save to database....
            return res.xhr ?
                res.render({ success: true }) :
                res.redirect(303, '/thank-you');
            
        } catch (error) {
            return res.xhr ?
                res.json({ error: 'Database error.' }) :
                res.redirect(303, '/database-error');
        }
    });

    app.get('/database-error', (req, res) => {
        res.render('errors/database-error');
    });
    /* ~ Processing forms */

    /* Processing API */
    const tours = [
        { id: 0, name: 'Hood River', price: 99.99 },
        { id: 1, name: 'Oregon Coast', price: 149.95 },
    ];

    // app.get('/api/tours', (req, res) => {
    //     res.json(tours);
    // }); // api returns strict json

    app.get('/api/tours', (req, res) => {
        let toursXml = `<?xml version="1.0"?><tours>
            ${ tours.map(tour => `<tour price="${ tour.price }" id="${ tour.id }">${ tour.name }</tour>`).join('') }</tours>`;
        let toursText = tours.map((tour) => `${ tour.id }: ${ tour.name } (${ tour.price })`).join('\n');
        res.format({
            'application/json': _=> {
                res.json(tours);
            },
            'application/xml': _=> {
                res.type('application/xml').send(toursXml);
            },
            'text/xml': _=> {
                res.type('text/xml').send(toursXml);
            },
            'text/plain': _=> {
                res.type('text/plain').send(toursText);
            }
        });
    }); // api returns by the request of the client header content type xml, json, or plaintext
    
    app.put('/api/tour/:id', (req, res) => {
        let tour = tours.find(p => p.id == req.params.id);
        if( tour ) {
            tour.name = req.query.name ? req.query.name : tour.name;
            tour.price = req.query.price ? req.query.price : tour.price;
            console.log(tour);
            res.json({success: true, code: 200, data: tour});
        } else {
            res.json({error: true, message: 'No such tour exists.', code: 401, data: null});
        }
    }); // api example with put endpoint

    app.delete('/api/tour/:id', function(req, res){
        let tourIdx = tours.findIndex(p => p.id == req.params.id);
        if (tourIdx >= 0){
            const tour = tours[tourIdx];
            tours.splice(tourIdx, 1);
            res.json({success: true, code: 200, data: tour, message: `selected tour deleted successfully`});
        } else {
            res.json({error: true, message: 'No such tour exists.', code: 401, data: null});
        }
        
    }); // api example with delete endpoint

    // write form fill to edit
    /* ~ Processing API */

    /* Rending view content examples  */
    app.get('/no-layout', (req, res) => {
        res.render('no-layout', {
            layout: null
        });
    }); // rendering a view without a layout

    app.get('/custom-layout', (req, res) => {
        res.render('custom-layout', {
            layout: 'custom'
        });
    }); // rendering a customized layout view output

    app.get('/plain-text', (req, res) => {
        res.type('text/plain')
            .send(`This is plain text`);
    }); // rendering plaintext output

    app.get('/json-text', (req, res) => {
        res.type('application/json')
            .send({name: 'Abdul', email: 'abdul@mail.com', phone: '08111234567'});
    }); // rendering json output
    /* ~ Rending view content examples  */

    /* Post Middlewares & Errors (Response code other than 200) */

    app.use((req, res) => {
        res.status(404)
            .render('exceptions/404', {
            helpers: {
                title: _=> 'Meadowlark Travel: 404'
            }
        });
    }); // custom 404 page & adding 404 page not found
    
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500)
            .render('exceptions/500', {
            helpers: {
                title: _=> 'Meadowlark Travel: 500'
            }
        });
    }); // custom 500 page & adding error handler example
    
    const appPort = app.get('port');
    app.listen(appPort, () => {
        console.log( `Express started on http://localhost:${appPort}; press Ctrl + C to terminate.` );
    });
