import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cors from 'cors';
import knex from 'knex';
import bcrypt from 'bcrypt-nodejs';

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: 'vspos123',
		database: 'qrcode'
	}
})


app.use(cors());
app.use(bodyParser.json());

// const db = {
// 	users: [
// 		{
// 			name: 'jhon',
// 			email: "jhon@gmail.com",	
// 			password: 'jhon'
// 		}
// 	]
// }

app.get('/',function(req,res) {
	if (req.body.email =='hello@gmail.com') {
		res.json(db.users)
	}
})

app.post('/signIn', function(req,res) {
	db.select('email', 'hash').from('login')
	.where('email','=',req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
		if(isValid) {
			return db.select("*").from('users')
			.where('email','=',req.body.email)
			.then(user => {
				res.json({
					result: 'Success',
					UserName: user[0].name
				});
			})
			.catch(err => res.status(400).json("Unable to get user"))
		} else {
			res.status(400).json("Failed")
		}
		
	})
	.catch(err => res.status(400).json("Wrong Credentials"))
})

app.post('/register', function(req,res){
	var hash = bcrypt.hashSync(req.body.password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: req.body.email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return db('users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				name: req.body.name,
				joined: new Date()
			})
			.then(() => {
				res.json('Success')
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('User already exists unable to register........'))
})

app.post('/userName', function(req,res){
	db.select('name').from('users')
	.where('email', '=', req.body.email)
	.then(data => {
		console.log(data[0])
		res.json(data[0])
	})
})

app.listen(5000);