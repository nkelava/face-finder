
const register = (req, resp, database, bcrypt) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return resp.status(400).json("Incorrect form submission!");
    }

    var hash = bcrypt.hashSync(password, 10);

    database
    .transaction(trx => {
        trx("login")
        .insert({
            hash:   hash,
            email:  email
        })
        .returning("email")
        .then(loginEmail => {
            return trx("users")
            .returning("*")
            .insert({
                username:   username,
                email:      loginEmail[0].email,
                hash:       hash,
                joined:     new Date()
            })
            .then(user => resp.json(user[0]))
            .catch(err => console.log(err));
        })
        .then(trx.commit)
        .catch(trx.rollback);  
    }).catch((err) => resp.status(400).json(`Unable to register. ${err}`));
};

module.exports = {
    register: register
}
