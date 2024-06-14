const { Sequelize }= require("sequelize");
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USERNAME!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: Number(process.env.DB_PORT),
    logging: false,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },

    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : undefined
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
      freezeTableName: true,
      underscoredAll: true
    }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Porch PlusDatabase Connected Successfully");
  } catch (error) {
      console.error("Unable to connect to the Porch Plus database:", error);
      }
      };
      

      export { sequelize, connectDB };