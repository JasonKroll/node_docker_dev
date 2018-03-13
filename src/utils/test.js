class Hello {
    constructor (name) {
        this.name = name    
    }

    greeting () {
        console.log(`Hello ${this.name}`)
    }
}

module.exports = Hello;
