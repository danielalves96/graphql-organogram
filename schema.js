const { gql } = require('graphql-tag');
const { v4: uuidv4 } = require('uuid');

const typeDefs = gql`
  type Query {
    departments(filter: DepartmentFilterInput, search: String, pageSize: Int, currentPage: Int): PaginatedDepartments
    people(filter: PersonFilterInput, search: String, pageSize: Int, currentPage: Int): PaginatedPeople
    departmentDetails(departmentId: ID!): Department
  }

  type PaginatedDepartments {
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Department]
  }

  type PaginatedPeople {
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Person]
  }

  type Department {
    id: ID!
    name: String
    code: String
    type: String
    numberOfPeople: Int
    enabled: Boolean
    people: [Person]
    children: [Department]
  }

  type Person {
    id: ID!
    name: String
    phone: String
    cpf: String
    departmentId: ID
    department: Department
  }

  input DepartmentFilterInput {
    name: String
    code: String
    type: String
    enabled: Boolean
  }

  input PersonFilterInput {
    name: String
    phone: String
    cpf: String
  }

  input CreateDepartmentInput {
    name: String!
    code: String!
    type: String!
    enabled: Boolean!
    parentId: ID
  }

  type Mutation {
    addPersonToDepartment(personId: ID!, departmentId: ID!): MutationResponse
    removePersonFromDepartment(personId: ID!, departmentId: ID!): MutationResponse
    activateDepartment(departmentId: ID!): MutationResponse
    deactivateDepartment(departmentId: ID!): MutationResponse
    addChildDepartment(parentDepartmentId: ID!, childDepartmentId: ID!): MutationResponse
    removeChildDepartment(parentDepartmentId: ID!, childDepartmentId: ID!): MutationResponse
    createDepartment(input: CreateDepartmentInput!): MutationResponse
  }

  type MutationResponse {
    status: String
    message: String
  }
`;

const buildDepartmentTree = async (departmentId, prisma) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: { people: true }
  });
  if (department) {
    const children = await prisma.department.findMany({ where: { parentId: department.id } });
    return {
      ...department,
      numberOfPeople: department.people.length,
      children: await Promise.all(children.map(child => buildDepartmentTree(child.id, prisma)))
    };
  }
  return null;
};

const resolvers = (prisma) => ({
  Query: {
    departments: async (parent, { filter, search, pageSize = 10, currentPage = 1 }) => {
      let departments = await prisma.department.findMany({ where: { parentId: null } });

      if (filter) {
        if (filter.name) {
          departments = departments.filter(dept => dept.name.includes(filter.name));
        }
        if (filter.code) {
          departments = departments.filter(dept => dept.code.includes(filter.code));
        }
        if (filter.type) {
          departments = departments.filter(dept => dept.type.includes(filter.type));
        }
        if (filter.enabled !== undefined) {
          departments = departments.filter(dept => dept.enabled === filter.enabled);
        }
      }

      if (search) {
        departments = departments.filter(dept =>
          dept.name.includes(search) ||
          dept.code.includes(search) ||
          dept.type.includes(search)
        );
      }

      const totalResults = departments.length;
      const totalPages = Math.ceil(totalResults / pageSize);
      const start = (currentPage - 1) * pageSize;
      const paginatedDepartments = departments.slice(start, start + pageSize);

      return {
        totalResults,
        totalPages,
        currentPage,
        results: await Promise.all(paginatedDepartments.map(department => buildDepartmentTree(department.id, prisma)))
      };
    },
    people: async (parent, { filter, search, pageSize = 10, currentPage = 1 }) => {
      let people = await prisma.person.findMany();

      if (filter) {
        if (filter.name) {
          people = people.filter(person => person.name.includes(filter.name));
        }
        if (filter.phone) {
          people = people.filter(person => person.phone.includes(filter.phone));
        }
        if (filter.cpf) {
          people = people.filter(person => person.cpf.includes(filter.cpf));
        }
      }

      if (search) {
        people = people.filter(person =>
          person.name.includes(search) ||
          person.phone.includes(search) ||
          person.cpf.includes(search)
        );
      }

      const totalResults = people.length;
      const totalPages = Math.ceil(totalResults / pageSize);
      const start = (currentPage - 1) * pageSize;
      const paginatedPeople = people.slice(start, start + pageSize);

      return {
        totalResults,
        totalPages,
        currentPage,
        results: paginatedPeople
      };
    },
    departmentDetails: async (parent, { departmentId }) => {
      return buildDepartmentTree(departmentId, prisma);
    }
  },
  Mutation: {
    addPersonToDepartment: async (parent, { personId, departmentId }) => {
      const person = await prisma.person.findUnique({ where: { id: personId } });
      if (!person) {
        return {
          status: "error",
          message: "Person not found | Pessoa não encontrada"
        };
      }

      if (person.departmentId === departmentId) {
        return {
          status: "error",
          message: "Person already in department | Pessoa já está no departamento"
        };
      }

      await prisma.person.update({
        where: { id: personId },
        data: { departmentId: departmentId }
      });

      await prisma.department.update({
        where: { id: departmentId },
        data: { numberOfPeople: { increment: 1 } }
      });

      return {
        status: "success",
        message: "Person added to department successfully | Pessoa adicionada ao departamento com sucesso"
      };
    },
    removePersonFromDepartment: async (parent, { personId, departmentId }) => {
      const person = await prisma.person.findUnique({ where: { id: personId } });
      if (!person) {
        return {
          status: "error",
          message: "Person not found | Pessoa não encontrada"
        };
      }

      if (person.departmentId !== departmentId) {
        return {
          status: "error",
          message: "Person is not in this department | Pessoa não está neste departamento"
        };
      }

      await prisma.person.update({
        where: { id: personId },
        data: { departmentId: null }
      });

      await prisma.department.update({
        where: { id: departmentId },
        data: { numberOfPeople: { decrement: 1 } }
      });

      return {
        status: "success",
        message: "Person removed from department successfully | Pessoa removida do departamento com sucesso"
      };
    },
    activateDepartment: async (parent, { departmentId }) => {
      const department = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!department) {
        return {
          status: "error",
          message: "Department not found | Departamento não encontrado"
        };
      }

      await prisma.department.update({
        where: { id: departmentId },
        data: { enabled: true }
      });

      return {
        status: "success",
        message: "Department activated successfully | Departamento ativado com sucesso"
      };
    },
    deactivateDepartment: async (parent, { departmentId }) => {
      const department = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!department) {
        return {
          status: "error",
          message: "Department not found | Departamento não encontrado"
        };
      }

      await prisma.department.update({
        where: { id: departmentId },
        data: { enabled: false }
      });

      return {
        status: "success",
        message: "Department deactivated successfully | Departamento desativado com sucesso"
      };
    },
    addChildDepartment: async (parent, { parentDepartmentId, childDepartmentId }) => {
      const parentDepartment = await prisma.department.findUnique({ where: { id: parentDepartmentId } });
      const childDepartment = await prisma.department.findUnique({ where: { id: childDepartmentId } });
      if (!parentDepartment || !childDepartment) {
        return {
          status: "error",
          message: "Parent or child department not found | Departamento pai ou filho não encontrado"
        };
      }

      if (childDepartment.parentId !== null) {
        return {
          status: "error",
          message: "Child department already has a parent | Departamento filho já possui um pai"
        };
      }

      await prisma.department.update({
        where: { id: childDepartmentId },
        data: { parentId: parentDepartmentId }
      });

      return {
        status: "success",
        message: "Child department added successfully | Departamento filho adicionado com sucesso"
      };
    },
    removeChildDepartment: async (parent, { parentDepartmentId, childDepartmentId }) => {
      const parentDepartment = await prisma.department.findUnique({ where: { id: parentDepartmentId } });
      const childDepartment = await prisma.department.findUnique({ where: { id: childDepartmentId } });
      if (!parentDepartment || !childDepartment) {
        return {
          status: "error",
          message: "Parent or child department not found | Departamento pai ou filho não encontrado"
        };
      }

      if (childDepartment.parentId !== parentDepartmentId) {
        return {
          status: "error",
          message: "Child department is not a child of the given parent | Departamento filho não é filho do pai fornecido"
        };
      }

      await prisma.department.update({
        where: { id: childDepartmentId },
        data: { parentId: null }
      });

      return {
        status: "success",
        message: "Child department removed successfully | Departamento filho removido com sucesso"
      };
    },
    createDepartment: async (parent, { input }) => {
      await prisma.department.create({
        data: {
          id: uuidv4(),
          name: input.name,
          code: input.code,
          type: input.type,
          enabled: input.enabled,
          parentId: input.parentId || null
        }
      });
      return {
        status: "success",
        message: "Department created successfully | Departamento criado com sucesso"
      };
    }
  }
});

module.exports = { typeDefs, resolvers };
