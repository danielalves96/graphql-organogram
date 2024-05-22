const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
const cpf = require('cpf-cnpj-validator').cpf;

const prisma = new PrismaClient();

const createDepartment = async (parentId, depth = 0, maxDepth = 4) => {
  if (depth > maxDepth) return null;

  const department = await prisma.department.create({
    data: {
      id: uuidv4(),
      name: faker.commerce.department(),
      code: faker.company.bsNoun(),
      type: faker.company.companySuffix(),
      enabled: faker.datatype.boolean(),
      parentId: parentId,
      numberOfPeople: 0
    }
  });

  const numChildren = faker.datatype.number({ min: 0, max: 3 });
  for (let i = 0; i < numChildren; i++) {
    await createDepartment(department.id, depth + 1, maxDepth);
  }

  return department.id;
};

const createPerson = async (departmentIds) => {
  const person = await prisma.person.create({
    data: {
      id: uuidv4(),
      name: faker.name.fullName(),
      phone: faker.phone.number('+55###########'),
      cpf: cpf.generate(),
    }
  });

  const numDepartments = faker.datatype.number({ min: 1, max: departmentIds.length });
  const departmentsForPerson = faker.helpers.arrayElements(departmentIds, numDepartments);

  for (let departmentId of departmentsForPerson) {
    await prisma.personOnDepartment.create({
      data: {
        personId: person.id,
        departmentId: departmentId,
      }
    });

    await prisma.department.update({
      where: { id: departmentId },
      data: { numberOfPeople: { increment: 1 } }
    });
  }

  return person;
};

const main = async () => {
  console.log('Start seeding ...');

  const departments = [];
  for (let i = 0; i < 6; i++) {
    const departmentId = await createDepartment(null);
    departments.push(departmentId);
  }

  for (let i = 0; i < 50; i++) {
    await createPerson(departments);
  }

  console.log('Seeding finished.');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
