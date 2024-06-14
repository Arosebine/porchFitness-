// import { DataTypes, Sequelize, Model } from 'sequelize';
import Member from '../models/member';
const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../config/porchdatabase');


const Addon = sequelize.define('Addon', {
    // id: {
    //     type: DataTypes.STRING,
    //     primaryKey: true,
    //     defaultValue: UUIDV4,
    // },
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    serviceName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    monthlyAmount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },    
    memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Member,
          key: 'id',
        },
      },
}, {
  sequelize,
  timestamps: true,
  modelName: 'AddonModel',
  freezeTableName: true,
});


Member.hasMany(Addon, { foreignKey: 'memberId' });
Addon.belongsTo(Member, { foreignKey: 'memberId' });


Addon.sync({}).then(()=>{
  console.log('Addon Table created successfully')
})

export default Addon;

