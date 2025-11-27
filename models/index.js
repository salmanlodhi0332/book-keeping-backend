const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// import models
db.User = require("./User")(sequelize, Sequelize);

module.exports = db;
