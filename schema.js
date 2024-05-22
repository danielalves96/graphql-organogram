const { gql } = require('graphql-tag');
const { v4: uuidv4 } = require('uuid');

const typeDefs = gql`
  type Query {
    departments(filter: DepartmentFilterInput, search: String, pageSize: Int, currentPage: Int): DepartmentsResponse
    people(filter: PersonFilterInput, search: String, pageSize: Int, currentPage: Int): PeopleResponse
    departmentDetails(departmentId: ID!): DepartmentResponse
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
    departments: [Department]
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

  input UpdateDepartmentInput {
    id: ID!
    name: String
    code: String
    type: String
    enabled: Boolean
    parentId: ID
  }

  type Mutation {
    addPersonToDepartment(personId: ID!, departmentId: ID!): MutationResponse
    removePersonFromDepartment(personId: ID!, departmentId: ID!): MutationResponse
    activateDepartment(departmentId: ID!): MutationResponse
    deactivateDepartment(departmentId: ID!): MutationResponse
    addChildDepartment(parentDepartmentId: ID!, childDepartmentId: ID!): MutationResponse
    removeChildDepartment(parentDepartmentId: ID!, childDepartmentId: ID!): MutationResponse
    createDepartment(input: CreateDepartmentInput!): DepartmentResponse
    updateDepartment(input: UpdateDepartmentInput!): DepartmentResponse
  }

  type MutationResponse {
    statusCode: Int
    status: String
    message: String
  }

  type DepartmentResponse {
    statusCode: Int
    status: String
    message: String
    result: Department
  }

  type PersonResponse {
    statusCode: Int
    status: String
    message: String
    result: Person
  }

  type DepartmentsResponse {
    statusCode: Int
    status: String
    message: String
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Department]
  }

  type PeopleResponse {
    statusCode: Int
    status: String
    message: String
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Person]
  }
`;

const buildDepartmentTree = async (departmentId, prisma) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      people: true,
      children: true
    }
  });

  if (department) {
    const childrenTree = await Promise.all(department.children.map(child => buildDepartmentTree(child.id, prisma)));

    return {
      ...department,
      numberOfPeople: department.people.length,
      ...(childrenTree.length > 0 && { children: childrenTree })
    };
  }
  return null;
};

const resolvers = (prisma) => ({
  Query: {
    departments: async (parent, { filter, search, pageSize = 10, currentPage = 1 }) => {
      try {
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
          statusCode: 200,
          status: "success",
          message: "Departments retrieved successfully | Departamentos recuperados com sucesso",
          totalResults,
          totalPages,
          currentPage,
          results: await Promise.all(paginatedDepartments.map(department => buildDepartmentTree(department.id, prisma)))
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    people: async (parent, { filter, search, pageSize = 10, currentPage = 1 }) => {
      try {
        let people = await prisma.person.findMany({
          include: {
            departments: {
              include: {
                department: true
              }
            }
          }
        });

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
          statusCode: 200,
          status: "success",
          message: "People retrieved successfully | Pessoas recuperadas com sucesso",
          totalResults,
          totalPages,
          currentPage,
          results: paginatedPeople
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    departmentDetails: async (parent, { departmentId }) => {
      try {
        const department = await buildDepartmentTree(departmentId, prisma);
        if (!department) {
          return {
            statusCode: 404,
            status: "error",
            message: "Department not found | Departamento não encontrado"
          };
        }
        return {
          statusCode: 200,
          status: "success",
          message: "Department retrieved successfully | Departamento recuperado com sucesso",
          result: department
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    }
  },
  Department: {
    people: async (department, args, context) => {
      try {
        const people = await context.prisma.personOnDepartment.findMany({
          where: {
            departmentId: department.id
          },
          include: {
            person: true
          }
        });

        return people.map(pd => pd.person);
      } catch (error) {
        throw new Error("Failed to fetch people | Falha ao buscar pessoas");
      }
    }
  },
  Person: {
    departments: async (person, args, context) => {
      try {
        const personDepartments = await context.prisma.personOnDepartment.findMany({
          where: {
            personId: person.id
          },
          include: {
            department: true
          }
        });

        return personDepartments.map(pd => pd.department);
      } catch (error) {
        throw new Error("Failed to fetch departments | Falha ao buscar departamentos");
      }
    }
  },
  Mutation: {
    addPersonToDepartment: async (parent, { personId, departmentId }) => {
      try {
        const person = await prisma.person.findUnique({ where: { id: personId } });
        if (!person) {
          return {
            statusCode: 404,
            status: "error",
            message: "Person not found | Pessoa não encontrada"
          };
        }

        await prisma.personOnDepartment.create({
          data: {
            personId: personId,
            departmentId: departmentId
          }
        });

        await prisma.department.update({
          where: { id: departmentId },
          data: { numberOfPeople: { increment: 1 } }
        });

        return {
          statusCode: 200,
          status: "success",
          message: "Person added to department successfully | Pessoa adicionada ao departamento com sucesso"
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    removePersonFromDepartment: async (parent, { personId, departmentId }) => {
      try {
        const person = await prisma.person.findUnique({ where: { id: personId } });
        if (!person) {
          return {
            statusCode: 404,
            status: "error",
            message: "Person not found | Pessoa não encontrada"
          };
        }

        await prisma.personOnDepartment.delete({
          where: {
            personId_departmentId: {
              personId: personId,
              departmentId: departmentId
            }
          }
        });

        await prisma.department.update({
          where: { id: departmentId },
          data: { numberOfPeople: { decrement: 1 } }
        });

        return {
          statusCode: 200,
          status: "success",
          message: "Person removed from department successfully | Pessoa removida do departamento com sucesso"
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    activateDepartment: async (parent, { departmentId }) => {
      try {
        const department = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!department) {
          return {
            statusCode: 404,
            status: "error",
            message: "Department not found | Departamento não encontrado"
          };
        }

        if (department.enabled) {
          return {
            statusCode: 409,
            status: "error",
            message: "Department is already active | Departamento já está ativo"
          };
        }

        await prisma.department.update({
          where: { id: departmentId },
          data: { enabled: true }
        });

        return {
          statusCode: 200,
          status: "success",
          message: "Department activated successfully | Departamento ativado com sucesso"
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    deactivateDepartment: async (parent, { departmentId }) => {
      try {
        const department = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!department) {
          return {
            statusCode: 404,
            status: "error",
            message: "Department not found | Departamento não encontrado"
          };
        }

        if (!department.enabled) {
          return {
            statusCode: 409,
            status: "error",
            message: "Department is already inactive | Departamento já está inativo"
          };
        }

        await prisma.department.update({
          where: { id: departmentId },
          data: { enabled: false }
        });

        return {
          statusCode: 200,
          status: "success",
          message: "Department deactivated successfully | Departamento desativado com sucesso"
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    addChildDepartment: async (parent, { parentDepartmentId, childDepartmentId }) => {
      try {
        const parentDepartment = await prisma.department.findUnique({ where: { id: parentDepartmentId } });
        const childDepartment = await prisma.department.findUnique({ where: { id: childDepartmentId } });
        if (!parentDepartment || !childDepartment) {
          return {
            statusCode: 404,
            status: "error",
            message: "Parent or child department not found | Departamento pai ou filho não encontrado"
          };
        }

        if (childDepartment.parentId !== null) {
          return {
            statusCode: 409,
            status: "error",
            message: "Child department already has a parent | Departamento filho já possui um pai"
          };
        }

        await prisma.department.update({
          where: { id: childDepartmentId },
          data: { parentId: parentDepartmentId }
        });

        return {
          statusCode: 200,
          status: "success",
          message: "Child department added successfully | Departamento filho adicionado com sucesso"
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    removeChildDepartment: async (parent, { parentDepartmentId, childDepartmentId }) => {
      try {
        const parentDepartment = await prisma.department.findUnique({ where: { id: parentDepartmentId } });
        const childDepartment = await prisma.department.findUnique({ where: { id: childDepartmentId } });
        if (!parentDepartment || !childDepartment) {
          return {
            statusCode: 404,
            status: "error",
            message: "Parent or child department not found | Departamento pai ou filho não encontrado"
          };
        }

        if (childDepartment.parentId !== parentDepartmentId) {
          return {
            statusCode: 409,
            status: "error",
            message: "Child department is not a child of the given parent | Departamento filho não é filho do pai fornecido"
          };
        }

        await prisma.department.update({
          where: { id: childDepartmentId },
          data: { parentId: null }
        });

        return {
          statusCode: 200,
          status: "success",
          message: "Child department removed successfully | Departamento filho removido com sucesso"
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    createDepartment: async (parent, { input }) => {
      try {
        const existingDepartment = await prisma.department.findUnique({ where: { code: input.code } });
        if (existingDepartment) {
          return {
            statusCode: 409,
            status: "error",
            message: "Department with this code already exists | Departamento com esse código já existe"
          };
        }

        const newDepartment = await prisma.department.create({
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
          statusCode: 201,
          status: "success",
          message: "Department created successfully | Departamento criado com sucesso",
          result: newDepartment
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    },
    updateDepartment: async (parent, { input }) => {
      try {
        const existingDepartment = await prisma.department.findUnique({ where: { id: input.id } });
        if (!existingDepartment) {
          return {
            statusCode: 404,
            status: "error",
            message: "Department not found | Departamento não encontrado"
          };
        }

        const updatedDepartment = await prisma.department.update({
          where: { id: input.id },
          data: {
            name: input.name,
            code: input.code,
            type: input.type,
            enabled: input.enabled,
            parentId: input.parentId
          }
        });

        return {
          statusCode: 200,
          status: "success",
          message: "Department updated successfully | Departamento atualizado com sucesso",
          result: updatedDepartment
        };
      } catch (error) {
        return {
          statusCode: 500,
          status: "error",
          message: "Internal server error | Erro interno do servidor"
        };
      }
    }
  }
});

module.exports = { typeDefs, resolvers };
