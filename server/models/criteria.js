module.exports = (sequelize, DataTypes) => {
    const Criteria = sequelize.define("Criteria", {
      name: { type: DataTypes.STRING, allowNull: false },
      weight: { type: DataTypes.FLOAT, allowNull: false },
      status: { type: DataTypes.BOOLEAN, defaultValue: true }
    });
    return Criteria;
  };
  