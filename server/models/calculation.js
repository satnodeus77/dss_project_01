module.exports = (sequelize, DataTypes) => {
    const Calculation = sequelize.define("Calculation", {
      userId: { type: DataTypes.STRING, allowNull: false },
      method: { type: DataTypes.STRING, allowNull: false },
      data: { type: DataTypes.JSON, allowNull: false }
    });
    return Calculation;
  };
  