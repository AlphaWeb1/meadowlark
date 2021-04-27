/* Data Declaration */
    const fortunes = [
        "Conquer your fears or they will conquer you.",
        "Rivers need springs.",
        "Do not fear what you don't know.",
        "You will have a pleasant surprise.",
        "Whenever possible, keep it simple.",
    ];

    exports.getFortune = () => {
        const idx = Math.floor(Math.random() * fortunes.length);
        return fortunes[idx];
    };

    exports.getFortunes = () => {
        return fortunes;
    };

    exports.addFortune = (data = null) => {
        data === "" || data === null  ? false : fortunes.push();
    };

    exports.setFortunes = (data = []) => {
        fortunes == data;
    };

    exports.removeFortune = (idx) => {
        forunes[idx] ? fortunes.splice(idx, 1) : false;
    };