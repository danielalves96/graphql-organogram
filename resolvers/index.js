const { departments } = require('./query/departments');
const { people } = require('./query/people');
const { departmentDetails } = require('./query/departmentDetails');

const { addPersonToDepartment } = require('./mutation/addPersonToDepartment');
const { removePersonFromDepartment } = require('./mutation/removePersonFromDepartment');
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
    departmentDetails
  },
  Mutation: {
    addPersonToDepartment,
    removePersonFromDepartment,
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
