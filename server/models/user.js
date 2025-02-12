module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      uid: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true }
    });
    return User;
  };
  