const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../config/porchdatabase');


const Member = sequelize.define('Member', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      membershipType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      isFirstMonth: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
}, {
  sequelize,
  timestamps: true,
  modelName: 'members',
  freezeTableName: true,
});




Member.sync({}).then(()=>{
  console.log('Member Table created successfully')
})

export default Member;

