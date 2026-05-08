"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("Users", "currency", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "USD",
    }),

  down: (queryInterface) =>
    queryInterface.removeColumn("Users", "currency"),
};
