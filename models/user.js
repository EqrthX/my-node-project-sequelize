const {DataTypes} = require('sequelize')

const sequelize = require('./database')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userType: {
        type: DataTypes.STRING,
        defaultValue: "user",
        allowNull: false
    }

})

User.sync({force: false}).then(() => {
    console.log('User Table created');
}).catch(err => {
    console.error(err)
})

module.exports = User