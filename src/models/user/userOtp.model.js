module.exports = (sequelize, DataTypes) => {
    return sequelize.define("UserOtp", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        otp: {
            type: DataTypes.STRING,
            allowNull: true
        },

        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        isUsed: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    }, {
        tableName: "user_otps"
    });
};
