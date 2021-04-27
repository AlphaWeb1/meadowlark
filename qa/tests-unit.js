const fortune = require('../lib/fortune.js'), expect = require('chai').expect;
suite('Fortune cookie tests', _=>{
    test('getFortune() should return a fortune', () =>{
        expect(typeof fortune.getFortune() === 'string');
    });
});