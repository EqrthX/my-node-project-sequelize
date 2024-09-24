const express = require('express')
const bodyParser = require('body-parser')
const User = require('./models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const app = express()

const sequelize = require('./models/database')
require('dotenv').config()

const secretKey = process.env.JWT_SECRET
const cookieParser = require('cookie-parser')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('asstes'))
app.use(cookieParser())

const hashPassword = async (password) => {

    const saltRound = 10
    return await bcrypt.hash(password, saltRound)

}

const initDB = async () => {
    
    try {
        await sequelize.sync({force: false})
        console.log('All tables were created successfully')
    } catch (error) {
        console.error('Error creating database: ', error)
    }

}

const verifyToken = (req, res, next) => {

    const token = req.cookies ? req.cookies.jwt : null

    if(!token) {

        req.user = null
        return next()

    }

    jwt.verify(token, secretKey, (err, decoded) => {

        if(err) {

            req.user = null

        } else {

            req.user = decoded

        }
        next()

    })

}

app.use(verifyToken)

app.get('/', (req, res) => {

    const username = req.user ? req.user.username : null;
    const userId = req.user ? req.user.userId : null

    res.render('index', {
        
        userId: userId,
        title: "Home",
        username: username

    })


})

app.get('/Login', (req, res) => {

    res.render('login', {
        title: "Login"
    })

})

app.post('/login', async (req, res) => {

    const {email, password} = req.body

    try {

        const user = await User.findOne({
            where: {email: email}})
        
        
        if(!user) {

            return res.status(400).send('User not found')

        }

        const match = await bcrypt.compare(password, user.password)

        if(match) {

            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username
                },
                secretKey,
                {expiresIn: '1h'}
                
            )

            res.cookie('jwt', token, {httpOnly: true, maxAge: 3600000})

            if(user.userType === 'user') {

                res.redirect(`/`)

            } else if(user.userType === 'admin') {

                res.redirect('/admin')

            } else {

                res.status(400).send('Invalid user type');

            }

        } else {

            res.status(400).send('Incorrect password')

        }

        
    } catch (error) {
     
        console.error('Login error:', error)
        res.status(500).send('Server error')

    }

})

app.post('/register', async (req, res) => {

    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const imageUrl = req.body.imageUrl

    if(!email || !username || !password || !imageUrl) {
        return res.status(400).send('Please fill in all fields')
    }

    try {

        const hashedPassword = await hashPassword(password)
        
        const user = await User.create({
            email: email,
            username: username,
            password: hashedPassword,
            imageUrl: imageUrl
        })

        console.log('User created: ', user);
        res.redirect('/login')

    } catch (error) {
        
        console.error('Error registration user: ', error)
        res.status(500).send('Server error')

    }

})

app.get('/logout', (req, res) => {

    res.clearCookie('jwt')
    res.redirect('/')

})

app.get('/admin', (req, res) => {
    res.render('adminPage', {
        title: "Admin Page"
    })
})

app.listen(3000, () => {

    console.log('Start server on port 3000');

})