const { departments } = require('./query/departments');
const { people } = require('./query/people');
const { departmentDetails } = require('./query/departmentDetails');
const { personDetails } = require('./query/personDetails'); // Importando a nova query

const { addPeopleToDepartment } = require('./mutation/addPeopleToDepartment');
const { removePeopleFromDepartment } = require('./mutation/removePeopleFromDepartment');
const { activateDepartment } = require('./mutation/activateDepartment');
const { deactivateDepartment } = require('./mutation/deactivateDepartment');
const { addChildDepartment } = require('./mutation/addChildDepartment');
const { removeChildDepartment } = require('./mutation/removeChildDepartment');
const { createDepartment } = require('./mutation/createDepartment');
const { updateDepartment } = require('./mutation/updateDepartment');

const { departmentResolvers } = require('./department');
const { personResolvers } = require('./person');

const resolvers = {
  Query: {
    departments,
    people,
    departmentDetails,
    personDetails
  },
  Mutation: {
    addPeopleToDepartment,
    removePeopleFromDepartment,
    activateDepartment,
    deactivateDepartment,
    addChildDepartment,
    removeChildDepartment,
    createDepartment,
    updateDepartment
  },
  ...departmentResolvers,
  ...personResolvers
};

module.exports = { resolvers };
