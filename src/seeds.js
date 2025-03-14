// src/seeds.js
const mongoose = require('mongoose');
const { databaseConnector } = require('./database');

// Import the models that we'll seed (models folder is inside src)
const UserModel = require("./models/User.js");
const PaymentModel = require("./models/Payment.js");
const OrderModel = require("./models/Order.js");
const StockModel = require("./models/Stock.js");
const DesignModel = require("./models/Design.js");
const FontModel = require("./models/Font.js");
const ClipartModel = require("./models/ClipArt.js");

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Create some raw data for the users collection.
const users = [
    {
        bandName: "Nirvana",
        label: "Sub Pop",
        genre: "Grunge",
        location: "Seattle, Washington",
        contactEmail: "nirvana@email.com",
        contactPhone: "555-555-5555",
        passwordHash: "password"
    },
    {
        bandName: "Rage Against the Machine",
        label: "Epic Records",
        genre: "Rap Metal",
        location: "Los Angeles, California",
        contactEmail: "ratm@email.com",
        contactPhone: "555-555-55456",
        passwordHash: "password"
    },
    {
        bandName: "The Cure",
        label: "Fiction Records",
        genre: "Post-Punk",
        location: "Crawley, West Sussex, England",
        contactEmail: "thecure@email.com",
        contactPhone: "555-555-5557",
        passwordHash: "password"
    }
];

// Empty arrays for other collections (to be filled in later)
const payments = [];
const orders = [];
const stocks = [];
const designs = [];
const fonts = [];
const cliparts = [];

// Determine the database URL based on NODE_ENV
let databaseURL = "";
switch (process.env.NODE_ENV.toLowerCase()) {
    case "test":
        databaseURL = "mongodb://localhost:27017/ExpressBuildAnAPI-test";
        break;
    case "development":
        databaseURL = "mongodb://localhost:27017/ExpressBuildAnAPI-dev";
        break;
    case "production":
        databaseURL = process.env.DATABASE_URL;
        break;
    default:
        console.error("Incorrect JS environment specified, database will not be connected.");
        break;
}

// Connect to the database and seed data using a promise chain.
databaseConnector(databaseURL)
    .then(() => {
        console.log("Database connected successfully!");
    })
    .catch(error => {
        console.log(`
        Some error occurred connecting to the database! It was: 
        ${error}
        `);
    })
    .then(async () => {
        if (process.env.WIPE === "true") {
            // Get the names of all collections in the DB.
            const collections = await mongoose.connection.db.listCollections().toArray();
            // Wait for all drop operations to complete.
            await Promise.all(
                collections.map((collection) => mongoose.connection.db.dropCollection(collection.name))
            );
            console.log("Old DB data deleted.");
        }
    })
    .then(async () => {
        const result = await UserModel.insertMany(users);
        console.log("User data seeded successfully. Inserted count:", result.length);
        // Additional seeding operations for other collections can be added here:
        // await PaymentModel.insertMany(payments);
        // await OrderModel.insertMany(orders);
        // await StockModel.insertMany(stocks);
        // await DesignModel.insertMany(designs);
        // await FontModel.insertMany(fonts);
        // await ClipartModel.insertMany(cliparts);
    })
    .then(() => {
        // Disconnect from the database.
        mongoose.connection.close();
        console.log("DB seed connection closed.");
    })
    .catch(error => {
        console.error("Error during seeding:", error);
    });
